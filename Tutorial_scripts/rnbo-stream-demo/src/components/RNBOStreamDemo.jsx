import React, { useRef, useState, useEffect } from 'react';
import { createDevice, ParameterNotificationSetting } from '@rnbo/js';

const RNBOStreamDemo = () => {
    const audioContextRef = useRef(null);
    const deviceRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const patcherDataRef = useRef(null); // Store patcher data for parameter ranges
    
    // Input streaming refs
    const mediaStreamRef = useRef(null);
    const mediaStreamSourceRef = useRef(null);
    const analyserRef = useRef(null);
    
    const [isLoaded, setIsLoaded] = useState(false);
    const [useMicInput, setUseMicInput] = useState(true);
    const [isMicActive, setIsMicActive] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [bypassRNBO, setBypassRNBO] = useState(false); // Test mode: bypass RNBO to verify audio works
    const bypassRNBORef = useRef(false); // Keep ref in sync for setupAudio
    
    // Amp-focused RNBO parameters (overdrive device)
    const [drive, setDrive] = useState(50); // 0-100, maps to drive parameter (increased for more noticeable effect)
    const [bass, setBass] = useState(50); // 0-100, maps to lowcut (inverted: 100-bass)
    const [treble, setTreble] = useState(50); // 0-100, maps to highcut (inverted: 100-treble)
    const [volume, setVolume] = useState(50); // 0-100, maps to volume (-100 to 100, centered at 0 = unity)
    const [mix, setMix] = useState(100); // 0-100, maps to mix (100 = fully wet/processed) - CRITICAL!
    const [inputGain, setInputGain] = useState(2.0); // Input gain multiplier (1.0 = unity, 2.0 = 6dB boost)
    const [rnboPatch, setRnboPatch] = useState('overdrive'); // Which RNBO patch to load: 'overdrive' or 'filterdelay'
    
    // FilterDelay-specific parameters
    const [time, setTime] = useState(75); // 0-100, delay time
    const [scale, setScale] = useState(0); // 0-6, scale
    const [color, setColor] = useState(0); // 0-100, color
    const [regen, setRegen] = useState(0); // 0-100, regeneration/feedback
    const [fb, setFb] = useState(0); // 0-1, feedback
    
    // Debug: track if device is ready
    const [deviceReady, setDeviceReady] = useState(false);
    const inputGainNodeRef = useRef(null); // Reference to input gain node for real-time adjustment

    // Setup microphone input
    const setupMicInput = async (context) => {
        try {
            console.log('Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                } 
            });
            mediaStreamRef.current = stream;
            
            const mediaStreamSource = context.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = mediaStreamSource;
            
            setIsMicActive(true);
            console.log('Audio interface connected');
            return mediaStreamSource;
        } catch (err) {
            console.error('Audio interface access error:', err);
            alert('Could not access microphone/audio interface. Please check permissions.');
            throw err;
        }
    };

    // Stop microphone input
    const stopMicInput = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        setIsMicActive(false);
        console.log('Audio interface disconnected');
    };

    // Setup audio with RNBO processing
    const setupAudio = async () => {
        // Sync ref with state
        bypassRNBORef.current = bypassRNBO;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const context = new AudioContextClass();
            audioContextRef.current = context;

            // Resume context (required for browser autoplay policy)
            if (context.state === 'suspended') {
                await context.resume();
            }

            console.log(`AudioContext state: ${context.state}`);
            console.log(`Sample rate: ${context.sampleRate}Hz`);

            // Create analyser for audio level monitoring (after RNBO processing)
            const analyser = context.createAnalyser();
            analyser.fftSize = 2048;
            analyserRef.current = analyser;

            // Determine audio source (mic or file)
            let audioSource = null;
            
            if (useMicInput) {
                audioSource = await setupMicInput(context);
            } else {
                console.log('Loading audio file...');
                const audioResponse = await fetch('/audio/practiceSetup.wav');
                const arrayBuffer = await audioResponse.arrayBuffer(); 
                const audioBuffer = await context.decodeAudioData(arrayBuffer);
                
                const source = context.createBufferSource();
                source.buffer = audioBuffer;
                source.loop = true;
                audioSource = source;
            }

            // Load RNBO device (user can choose which patch)
            const patchFile = rnboPatch === 'overdrive' ? 'rnbo.overdrive.json' : 'rnbo.filterdelay.json';
            console.log(`Loading RNBO device: ${patchFile}...`);
            const response = await fetch(`/export/${patchFile}`);
            const patcher = await response.json();
            patcherDataRef.current = patcher; // Store for parameter ranges

            const device = await createDevice({
                context: context,
                options: {
                    parameterNotificationSetting: ParameterNotificationSetting.All
                }, 
                patcher: patcher
            });

            deviceRef.current = device;
            setDeviceReady(true);

            // Log all available parameters for debugging
            console.log('=== RNBO Device Parameters ===');
            device.parameters.forEach(param => {
                // Get ranges from patcher data
                const paramDef = patcher.desc.parameters.find(p => p.paramId === param.id);
                const min = paramDef?.minimum ?? (param.min !== undefined ? param.min : 0);
                const max = paramDef?.maximum ?? (param.max !== undefined ? param.max : 100);
                console.log(`  ${param.id}: ${min} to ${max} (current: ${param.value})`);
            });
            console.log('==============================');
            
            // Check for bypass or enable parameters that might disable processing
            const bypassParam = device.parametersById.get('bypass');
            const enableParam = device.parametersById.get('enable');
            const onParam = device.parametersById.get('on');
            
            if (bypassParam) {
                bypassParam.value = 0; // 0 = not bypassed (processing enabled)
                console.log('✓ Bypass disabled (processing enabled)');
            }
            if (enableParam) {
                enableParam.value = 1; // 1 = enabled
                console.log('✓ Device enabled');
            }
            if (onParam) {
                onParam.value = 1; // 1 = on
                console.log('✓ Device turned on');
            }

            // Helper to get parameter range from patcher data
            const getParamRange = (paramId) => {
                const paramDef = patcher.desc.parameters.find(p => p.paramId === paramId);
                if (paramDef) {
                    return { min: paramDef.minimum, max: paramDef.maximum };
                }
                // Fallback defaults
                return { min: 0, max: 100 };
            };

            // Set initial parameters based on which patch is loaded
            console.log('Setting initial parameters...');
            
            // Check which patch we're using and set parameters accordingly
            const isOverdrive = rnboPatch === 'overdrive';
            const isFilterDelay = rnboPatch === 'filterdelay';
            
            // Common parameters (both patches)
            const volumeParam = device.parametersById.get('volume');
            const mixParam = device.parametersById.get('mix');
            
            // Overdrive-specific parameters
            const driveParam = isOverdrive ? device.parametersById.get('drive') : null;
            const lowcutParam = isOverdrive ? device.parametersById.get('lowcut') : null;
            const highcutParam = isOverdrive ? device.parametersById.get('highcut') : null;
            
            // FilterDelay-specific parameters
            const inputParam = isFilterDelay ? device.parametersById.get('input') : null;
            
            // CRITICAL: For FilterDelay patch, set input parameter to 1 to enable input processing!
            if (inputParam) {
                const range = getParamRange('input');
                inputParam.value = Math.max(range.min, Math.min(range.max, 1)); // Set to 1 (max) to enable input
                console.log(`✓ Input parameter set to: ${inputParam.value} (enables input processing, range: ${range.min}-${range.max})`);
                console.log(`⚠️ CRITICAL: Input parameter must be 1 for FilterDelay to process audio!`);
            }
            
            // Set parameters with proper clamping using patcher ranges
            // IMPORTANT: Set drive to a noticeable value so we can hear the effect
            if (driveParam) {
                const range = getParamRange('drive');
                // Use a higher drive value for more noticeable effect
                const driveValue = Math.max(30, drive); // At least 30% drive
                const clampedValue = Math.max(range.min, Math.min(range.max, driveValue));
                driveParam.value = clampedValue;
                setDrive(clampedValue); // Update state
                console.log(`✓ Drive set to: ${clampedValue} (range: ${range.min}-${range.max})`);
            } else {
                console.warn('⚠ Drive parameter not found!');
            }
            
            if (lowcutParam) {
                // Invert: more bass = less lowcut filtering
                const range = getParamRange('lowcut');
                const bassValue = 100 - bass;
                const clampedValue = Math.max(range.min, Math.min(range.max, bassValue));
                lowcutParam.value = clampedValue;
                console.log(`✓ Lowcut (Bass) set to: ${clampedValue} (bass slider: ${bass})`);
            } else {
                console.warn('⚠ Lowcut parameter not found!');
            }
            
            if (highcutParam) {
                // Invert: more treble = less highcut filtering
                const range = getParamRange('highcut');
                const trebleValue = 100 - treble;
                const clampedValue = Math.max(range.min, Math.min(range.max, trebleValue));
                highcutParam.value = clampedValue;
                console.log(`✓ Highcut (Treble) set to: ${clampedValue} (treble slider: ${treble})`);
            } else {
                console.warn('⚠ Highcut parameter not found!');
            }
            
            if (volumeParam) {
                // Convert 0-100 slider to -100 to 100 parameter range
                const range = getParamRange('volume');
                const volValue = (volume - 50) * 2;
                const clampedValue = Math.max(range.min, Math.min(range.max, volValue));
                volumeParam.value = clampedValue;
                console.log(`✓ Volume set to: ${clampedValue} (slider: ${volume}, range: ${range.min}-${range.max})`);
            } else {
                console.warn('⚠ Volume parameter not found!');
            }
            
            if (mixParam) {
                const range = getParamRange('mix');
                // CRITICAL: Set mix to 100 (fully wet) to hear the processed signal
                const clampedValue = Math.max(range.min, Math.min(range.max, 100));
                mixParam.value = clampedValue;
                setMix(100); // Update state to match
                console.log(`✓ Mix set to: ${clampedValue} (100% = fully processed, range: ${range.min}-${range.max})`);
                console.log(`⚠ IMPORTANT: Mix must be 100% to hear processed audio!`);
            } else {
                console.warn('⚠ Mix parameter not found!');
            }
            
            // Also ensure volume is set to a reasonable level
            if (volumeParam) {
                const range = getParamRange('volume');
                // For FilterDelay: set volume higher since static disappears = it's working but quiet
                // For Overdrive: keep at unity
                const safeVol = rnboPatch === 'filterdelay' ? 50 : 0; // Higher volume for FilterDelay
                volumeParam.value = Math.max(range.min, Math.min(range.max, safeVol));
                setVolume(75); // Update slider to match (75 = 50 in -100 to 100 range)
                console.log(`✓ Volume set to: ${volumeParam.value} (range: ${range.min}-${range.max})`);
                if (rnboPatch === 'filterdelay') {
                    console.log(`   💡 FilterDelay: Volume set higher since patch is processing but output is quiet`);
                }
            }
            
            // Set FilterDelay-specific parameters to make the effect more audible
            if (isFilterDelay) {
                const timeParam = device.parametersById.get('time');
                const regenParam = device.parametersById.get('regen');
                const colorParam = device.parametersById.get('color');
                
                if (timeParam) {
                    const range = getParamRange('time');
                    timeParam.value = Math.max(range.min, Math.min(range.max, time));
                    console.log(`✓ Time set to: ${timeParam.value} (range: ${range.min}-${range.max})`);
                }
                
                if (regenParam) {
                    const range = getParamRange('regen');
                    regenParam.value = Math.max(range.min, Math.min(range.max, 30)); // Set some regen for audible effect
                    setRegen(30);
                    console.log(`✓ Regen set to: ${regenParam.value} (range: ${range.min}-${range.max})`);
                }
                
                if (colorParam) {
                    const range = getParamRange('color');
                    colorParam.value = Math.max(range.min, Math.min(range.max, color));
                    console.log(`✓ Color set to: ${colorParam.value} (range: ${range.min}-${range.max})`);
                }
            }
            
            console.log('Initial parameters summary:', {
                input: inputParam?.value ?? 'N/A',
                drive: driveParam?.value ?? 'N/A',
                lowcut: lowcutParam?.value ?? 'N/A',
                highcut: highcutParam?.value ?? 'N/A',
                volume: volumeParam?.value ?? 'N/A',
                mix: mixParam?.value ?? 'N/A'
            });

            // Debug: Check RNBO device structure
            console.log('🔍 RNBO Device Node Structure:');
            console.log('  device.node:', device.node);
            console.log('  device.node.numberOfInputs:', device.node.numberOfInputs);
            console.log('  device.node.numberOfOutputs:', device.node.numberOfOutputs);
            console.log('  device.node.channelCount:', device.node.channelCount);
            console.log('  device.node.channelCountMode:', device.node.channelCountMode);
            
            // CRITICAL: Verify mix is set to 100 BEFORE connecting
            if (mixParam) {
                mixParam.value = 100; // Force to 100% (fully wet)
                console.log(`🔧 FORCED Mix to 100%: ${mixParam.value}`);
            }
            
            // Create input gain to boost signal before RNBO (guitar signals can be quiet)
            const inputGainNode = context.createGain();
            inputGainNode.gain.value = inputGain; // Use state value
            inputGainNodeRef.current = inputGainNode; // Store for real-time adjustment
            console.log(`🔊 Input gain set to: ${inputGain}x (${(20 * Math.log10(inputGain)).toFixed(1)}dB)`);
            
            // Create a gain node for output volume control (safety)
            const outputGain = context.createGain();
            outputGain.gain.value = 1.0; // Unity gain
            
            // Create analyser for INPUT monitoring (parallel connection, doesn't interfere)
            const inputAnalyser = context.createAnalyser();
            inputAnalyser.fftSize = 2048;
            
            // Connect audio chain: source -> input gain -> RNBO device -> output gain -> analyser -> destination
            // SIMPLIFIED: Direct connection - analyser only for monitoring output
            
            try {
                if (bypassRNBORef.current) {
                    // TEST MODE: Bypass RNBO to verify audio input works
                    console.log('⚠ TEST MODE: Bypassing RNBO - connecting source directly to output');
                    audioSource.connect(inputGainNode);
                    inputGainNode.connect(analyser);
                    analyser.connect(context.destination);
                    console.log('✅ Connected audioSource -> inputGain -> analyser -> destination (RNBO bypassed)');
                    console.log('💡 If you hear audio now, the issue is with RNBO processing, not audio input');
                } else {
                    // NORMAL MODE: Connect through RNBO with DIRECT connection
                    // CRITICAL: Connect directly - no analyser in the signal path
                    // CRITICAL: Ensure audioSource is ONLY connected to inputGain (not directly to destination)
                    
                    // Disconnect audioSource from anything it might be connected to
                    if (audioSource.numberOfOutputs > 0) {
                        try {
                            audioSource.disconnect();
                        } catch (e) {
                            // Ignore if already disconnected
                        }
                    }
                    
                    // MAIN SIGNAL PATH: input gain -> RNBO device (DIRECT)
                    audioSource.connect(inputGainNode);
                    
                    // CRITICAL: The device has 2 inputs (in1 and in2)
                    // For FilterDelay: static disappears when guitar plays = patch IS processing!
                    // Try connecting to input 0 (in1) for FilterDelay, as it might be the primary input
                    try {
                        // Disconnect from any previous connections
                        try {
                            inputGainNode.disconnect(device.node, 0, 0);
                            inputGainNode.disconnect(device.node, 0, 1);
                        } catch (e) {
                            // Ignore if not connected
                        }
                        
                        // For FilterDelay: try input 0 first (since static disappears = it's working!)
                        // For Overdrive: try input 1 (we tested this before)
                        const targetInput = rnboPatch === 'filterdelay' ? 0 : 1;
                        inputGainNode.connect(device.node, 0, targetInput);
                        console.log('✅ Connected audioSource -> inputGain -> device.node');
                        console.log(`   → Connected to input ${targetInput} (RNBO ${targetInput === 0 ? 'in1' : 'in2'})`);
                        if (rnboPatch === 'filterdelay') {
                            console.log(`   💡 FilterDelay: Static disappearing when you play = patch IS processing!`);
                            console.log(`   💡 Try increasing Volume, Time, or Regen to hear the processed guitar better.`);
                        }
                    } catch (e) {
                        console.error(`❌ Error connecting to RNBO device: ${e.message}`);
                        throw e;
                    }
                    
                    console.log(`💡 Input gain set to ${inputGain}x (${(20 * Math.log10(inputGain)).toFixed(1)}dB boost)`);
                    console.log(`⚠️ DIAGNOSIS: Input levels show signal reaching RNBO, output levels change with volume`);
                    console.log(`⚠️ BUT: Only static is heard, not guitar. This suggests the Max patch isn't routing input correctly.`);
                    console.log(`💡 The Max patch may need to be fixed in Max/MSP to properly process the input signal.`);
                    
                    // CRITICAL: Verify device.node is actually an AudioNode
                    if (!device.node || typeof device.node.connect !== 'function') {
                        console.error('❌ ERROR: device.node is not a valid AudioNode!');
                        throw new Error('RNBO device.node is not a valid AudioNode');
                    }
                    
                    // Connect RNBO device output to gain -> analyser -> destination
                    // CRITICAL: Only connect device.node output - this ensures we ONLY hear processed audio
                    device.node.connect(outputGain);
                    outputGain.connect(analyser);
                    analyser.connect(context.destination);
                    console.log('✅ Connected device.node -> outputGain -> analyser -> destination');
                    console.log('🔍 Signal path: Guitar -> Input Gain -> RNBO Device -> Output Gain -> Speakers');
                    console.log('⚠️ CRITICAL: Only processed audio should be playing. If you hear dry guitar, there is a routing issue.');
                    
                    // Also connect input gain to analyser in PARALLEL for monitoring (doesn't affect signal)
                    inputGainNode.connect(inputAnalyser);
                    
                    // Monitor input levels to verify signal is reaching RNBO
                    const inputFreqData = new Uint8Array(inputAnalyser.frequencyBinCount);
                    const inputTimeData = new Uint8Array(inputAnalyser.fftSize);
                    const checkInputLevel = () => {
                        if (inputAnalyser && isLoaded) {
                            inputAnalyser.getByteFrequencyData(inputFreqData);
                            inputAnalyser.getByteTimeDomainData(inputTimeData);
                            
                            // Calculate RMS from time domain data
                            let sumSquares = 0;
                            for (let i = 0; i < inputTimeData.length; i++) {
                                const normalized = (inputTimeData[i] - 128) / 128;
                                sumSquares += normalized * normalized;
                            }
                            const rms = Math.sqrt(sumSquares / inputTimeData.length);
                            const inputLevel = Math.min(100, rms * 200);
                            
                            const freqMax = Math.max(...inputFreqData);
                            const freqLevel = (freqMax / 255) * 100;
                            
                            if (inputLevel > 1 || freqLevel > 5) {
                                console.log(`🎤 Input to RNBO - RMS: ${inputLevel.toFixed(1)}%, Freq Peak: ${freqLevel.toFixed(1)}%`);
                                // Update global reference for output monitoring comparison
                                if (window._lastInputLevel) {
                                    window._lastInputLevel.value = inputLevel;
                                }
                            }
                        }
                    };
                    // Check input level every second
                    const inputLevelInterval = setInterval(checkInputLevel, 1000);
                    // Store interval ID for cleanup
                    setTimeout(() => clearInterval(inputLevelInterval), 30000); // Monitor for 30 seconds
                    
                    // CRITICAL DEBUG: Verify RNBO device is actually receiving audio
                    console.log('🔍 RNBO Device Connection Debug:');
                    console.log('  Device node inputs:', device.node.numberOfInputs);
                    console.log('  Device node outputs:', device.node.numberOfOutputs);
                    console.log('  Device node channel count:', device.node.channelCount);
                    console.log('  Input gain node connected:', inputGainNode.numberOfOutputs > 0);
                    console.log('  ⚠️ If you hear static but not guitar, RNBO may not be processing the input correctly');
                    console.log('  💡 Try: Increase Drive to 100%, check Mix is at 100%, verify Volume is not at minimum');
                    
                    // CRITICAL: Double-check mix parameter is actually at 100%
                    const currentMix = mixParam ? mixParam.value : 'N/A';
                    console.log(`  🔧 Current Mix parameter value: ${currentMix} (should be 100)`);
                    if (mixParam && mixParam.value !== 100) {
                        console.warn('  ⚠️ WARNING: Mix is not at 100%! Forcing to 100%...');
                        mixParam.value = 100;
                        setMix(100);
                    }
                    
                    // CRITICAL: Verify drive is not at 0
                    const currentDrive = driveParam ? driveParam.value : 'N/A';
                    console.log(`  🔧 Current Drive parameter value: ${currentDrive}`);
                    if (driveParam && driveParam.value === 0) {
                        console.warn('  ⚠️ WARNING: Drive is at 0! Setting to 50...');
                        driveParam.value = 50;
                        setDrive(50);
                    }
                    
                    // CRITICAL: Ensure volume is at a reasonable level (not at minimum)
                    const currentVolume = volumeParam ? volumeParam.value : 'N/A';
                    console.log(`  🔧 Current Volume parameter value: ${currentVolume} (range: -100 to 100)`);
                    if (volumeParam && volumeParam.value <= -50) {
                        console.warn('  ⚠️ WARNING: Volume is very low! Setting to 0 (unity gain)...');
                        volumeParam.value = 0;
                        setVolume(50); // Update slider to center position
                    }
                    
                    // CRITICAL: Log all parameter values for debugging
                    console.log('📊 Final RNBO Parameter Values:');
                    device.parameters.forEach(param => {
                        console.log(`  ${param.id}: ${param.value} (range: ${param.minimum} to ${param.maximum})`);
                    });
                    
                    // CRITICAL: Add a test to verify the device is actually processing input
                    // Create a test analyser on the device output to see if ANY audio is coming out
                    const testAnalyser = context.createAnalyser();
                    testAnalyser.fftSize = 2048;
                    // Connect device output to test analyser in PARALLEL (doesn't affect main signal)
                    device.node.connect(testAnalyser);
                    
                    const testFreqData = new Uint8Array(testAnalyser.frequencyBinCount);
                    const testTimeData = new Uint8Array(testAnalyser.fftSize);
                    let lastOutputLevel = 0;
                    let outputConstantCount = 0;
                    const checkOutputLevel = () => {
                        if (testAnalyser && isLoaded) {
                            testAnalyser.getByteFrequencyData(testFreqData);
                            testAnalyser.getByteTimeDomainData(testTimeData);
                            
                            // Calculate RMS from time domain data
                            let sumSquares = 0;
                            for (let i = 0; i < testTimeData.length; i++) {
                                const normalized = (testTimeData[i] - 128) / 128;
                                sumSquares += normalized * normalized;
                            }
                            const rms = Math.sqrt(sumSquares / testTimeData.length);
                            const outputLevel = Math.min(100, rms * 200);
                            
                            const freqMax = Math.max(...testFreqData);
                            const freqLevel = (freqMax / 255) * 100;
                            
                            // Check if output is constant (not responding to input)
                            const outputChanged = Math.abs(outputLevel - lastOutputLevel) > 0.5;
                            if (!outputChanged && outputLevel > 1) {
                                outputConstantCount++;
                            } else {
                                outputConstantCount = 0;
                            }
                            
                            // If output has been constant for 5+ seconds with input present, warn about Max patch issue
                            if (outputConstantCount >= 5 && outputLevel > 5) {
                                const inputLevel = window._lastInputLevel?.value || 0;
                                if (inputLevel > 10) { // Only warn if there's significant input
                                    console.warn(`⚠️ MAX PATCH ISSUE DETECTED:`);
                                    console.warn(`   Input: ${inputLevel.toFixed(1)}% | Output: ${outputLevel.toFixed(1)}% (constant)`);
                                    console.warn(`   The Max patch is NOT processing the input signal!`);
                                    console.warn(`   Fix: Open the patch in Max/MSP and verify input inlets are connected to the processing chain.`);
                                    outputConstantCount = 0; // Reset to avoid spam
                                }
                            }
                            
                            if (outputLevel > 1 || freqLevel > 5) {
                                console.log(`🔊 RNBO OUTPUT - RMS: ${outputLevel.toFixed(1)}%, Freq Peak: ${freqLevel.toFixed(1)}%`);
                            }
                            
                            lastOutputLevel = outputLevel;
                        }
                    };
                    // Check output level every second
                    const outputLevelInterval = setInterval(checkOutputLevel, 1000);
                    setTimeout(() => clearInterval(outputLevelInterval), 30000); // Monitor for 30 seconds
                    console.log('🔍 Monitoring RNBO device OUTPUT levels - check console for "RNBO OUTPUT" messages');
                }
                
                // Verify the audio graph
                console.log('🔗 Audio routing verification:');
                console.log('  Source type:', audioSource.constructor.name);
                console.log('  Device node type:', device.node.constructor.name);
                console.log('  Device has inputs:', device.node.numberOfInputs > 0);
                console.log('  Device has outputs:', device.node.numberOfOutputs > 0);
                
                
            } catch (err) {
                console.error('❌ Error connecting audio:', err);
                throw err;
            }

            // Start playback if using file source
            if (!useMicInput && audioSource.start) {
                audioSource.start();
            }
            
            sourceNodeRef.current = audioSource;
            
            setIsLoaded(true);
            console.log(`✅ Audio setup complete - ${useMicInput ? 'Live Input' : 'File Playback'} through RNBO Overdrive`);
            console.log('📊 Available parameters:', device.parameters.map(p => {
                const paramDef = patcher.desc.parameters.find(pp => pp.paramId === p.id);
                const min = paramDef?.minimum ?? '?';
                const max = paramDef?.maximum ?? '?';
                return `${p.id} (${min} to ${max})`;
            }));
            console.log('🔊 Audio routing: source → RNBO device → analyser → destination');
            console.log('💡 Tip: Adjust Drive, Bass, Treble, Volume, and Mix sliders to hear the effect!');

        } catch (err) {
            console.error('Audio setup failed:', err);
            if (useMicInput) {
                stopMicInput();
            }
        }
    };

    // Toggle between mic input and audio file
    const toggleInputSource = () => {
        const newUseMicInput = !useMicInput;
        setUseMicInput(newUseMicInput);
        
        if (isLoaded) {
            // Stop current audio
            if (sourceNodeRef.current) {
                if (sourceNodeRef.current.stop) {
                    sourceNodeRef.current.stop();
                }
                sourceNodeRef.current.disconnect();
            }
            if (useMicInput) {
                stopMicInput();
            }
            
            // Disconnect device
            if (deviceRef.current) {
                deviceRef.current.node.disconnect();
            }
            
            // Reset and restart with new source
            setIsLoaded(false);
            setTimeout(() => {
                setupAudio();
            }, 100);
        }
    };

    // Stop audio
    const stopAudio = async () => {
        console.log('Stopping audio...');
        
        if (sourceNodeRef.current) {
            if (sourceNodeRef.current.stop) {
                sourceNodeRef.current.stop();
            }
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        
        if (deviceRef.current) {
            deviceRef.current.node.disconnect();
            deviceRef.current = null;
        }
        
        if (analyserRef.current) {
            analyserRef.current.disconnect();
            analyserRef.current = null;
        }
        
        if (useMicInput) {
            stopMicInput();
        }
        
        if (audioContextRef.current) {
            await audioContextRef.current.close();
            audioContextRef.current = null;
        }
        
        setIsLoaded(false);
        setAudioLevel(0);
        setDeviceReady(false);
        console.log('Audio stopped');
    };

    // RNBO parameter update helper
    const updateRNBOParam = (paramId, value) => {
        if (deviceRef.current && patcherDataRef.current) {
            const param = deviceRef.current.parametersById.get(paramId);
            if (param) {
                // Get range from patcher data
                const paramDef = patcherDataRef.current.desc.parameters.find(p => p.paramId === paramId);
                const min = paramDef?.minimum ?? 0;
                const max = paramDef?.maximum ?? 100;
                
                // Clamp value to parameter range
                const clampedValue = Math.max(min, Math.min(max, value));
                const oldValue = param.value;
                param.value = clampedValue;
                
                // Only log if value actually changed (reduces console spam)
                if (Math.abs(oldValue - clampedValue) > 0.01) {
                    console.log(`🎛️ ${paramId}: ${oldValue.toFixed(2)} → ${clampedValue.toFixed(2)}`);
                }
            } else {
                console.warn(`⚠ Parameter '${paramId}' not found in RNBO device!`);
                console.log('Available parameters:', Array.from(deviceRef.current.parametersById.keys()));
            }
        } else {
            console.warn('⚠ Device not initialized yet');
        }
    };

    // Amp control handlers - ensure device is ready before updating
    // Only update parameters that exist in the current patch
    const handleDriveChange = (e) => {
        const val = parseFloat(e.target.value);
        setDrive(val);
        if (deviceReady && deviceRef.current && rnboPatch === 'overdrive') {
            updateRNBOParam('drive', val);
        }
    };

    const handleBassChange = (e) => {
        const val = parseFloat(e.target.value);
        setBass(val);
        if (deviceReady && deviceRef.current && rnboPatch === 'overdrive') {
            // Invert: more bass = less lowcut filtering
            updateRNBOParam('lowcut', 100 - val);
        }
    };

    const handleTrebleChange = (e) => {
        const val = parseFloat(e.target.value);
        setTreble(val);
        if (deviceReady && deviceRef.current && rnboPatch === 'overdrive') {
            // Invert: more treble = less highcut filtering
            updateRNBOParam('highcut', 100 - val);
        }
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (deviceReady && deviceRef.current) {
            // Convert 0-100 slider to -100 to 100 parameter range
            updateRNBOParam('volume', (val - 50) * 2);
        }
    };

    const handleMixChange = (e) => {
        const val = parseFloat(e.target.value);
        setMix(val);
        if (deviceReady && deviceRef.current) {
        updateRNBOParam('mix', val);
        }
    };

    const handleInputGainChange = (e) => {
        const val = parseFloat(e.target.value);
        setInputGain(val);
        if (inputGainNodeRef.current) {
            inputGainNodeRef.current.gain.value = val;
            console.log(`🔊 Input gain adjusted to: ${val}x (${(20 * Math.log10(val)).toFixed(1)}dB)`);
        }
    };
    
    // FilterDelay parameter handlers
    const handleTimeChange = (e) => {
        const val = parseFloat(e.target.value);
        setTime(val);
        if (deviceReady && deviceRef.current && rnboPatch === 'filterdelay') {
            updateRNBOParam('time', val);
        }
    };

    const handleRegenChange = (e) => {
        const val = parseFloat(e.target.value);
        setRegen(val);
        if (deviceReady && deviceRef.current && rnboPatch === 'filterdelay') {
        updateRNBOParam('regen', val);
        }
    };
    
    const handleColorChange = (e) => {
        const val = parseFloat(e.target.value);
        setColor(val);
        if (deviceReady && deviceRef.current && rnboPatch === 'filterdelay') {
            updateRNBOParam('color', val);
        }
    };
    
    const handleFbChange = (e) => {
        const val = parseFloat(e.target.value);
        setFb(val);
        if (deviceReady && deviceRef.current && rnboPatch === 'filterdelay') {
        updateRNBOParam('fb', val);
        }
    };

    // Monitor audio levels (after RNBO processing)
    useEffect(() => {
        if (!isLoaded || !analyserRef.current) return;
        
        let animationFrame;
        const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
        const timeData = new Uint8Array(analyserRef.current.fftSize);
        
        const checkLevel = () => {
            if (analyserRef.current && isLoaded) {
                analyserRef.current.getByteFrequencyData(freqData);
                const freqMax = Math.max(...freqData);
                
                analyserRef.current.getByteTimeDomainData(timeData);
                
                // Calculate RMS
                let sumSquares = 0;
                for (let i = 0; i < timeData.length; i++) {
                    const normalized = (timeData[i] - 128) / 128;
                    sumSquares += normalized * normalized;
                }
                const rms = Math.sqrt(sumSquares / timeData.length);
                
                // Calculate peak
                let peak = 0;
                for (let i = 0; i < timeData.length; i++) {
                    const normalized = Math.abs((timeData[i] - 128) / 128);
                    if (normalized > peak) peak = normalized;
                }
                
                const level = Math.max(rms * 100, peak * 80);
                const freqLevel = (freqMax / 255) * 100;
                const finalLevel = Math.min(100, Math.max(level, freqLevel * 0.7));
                
                // Cap at 100% and prevent stuck values
                const cappedLevel = Math.min(100, Math.max(0, finalLevel));
                setAudioLevel(cappedLevel);
                
                animationFrame = requestAnimationFrame(checkLevel);
            }
        };
        
        checkLevel();
        
        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [isLoaded]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (mediaStreamSourceRef.current) {
                mediaStreamSourceRef.current.disconnect();
            }
        };
    }, []);

    return (
        <div style={{ 
            padding: '20px', 
            background: '#222', 
            color: 'white', 
            borderRadius: '8px', 
            textAlign: 'center',
            maxWidth: '800px',
            width: '100%'
        }}>
            <h1>RNBO Amp Simulator</h1>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>
                Live audio input streaming through RNBO Overdrive
            </p>

            {!isLoaded ? (
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ marginBottom: '10px' }}>
                        <label style={{ marginRight: '10px', fontSize: '16px' }}>
                            Input Source:
                        </label>
                        <select 
                            value={useMicInput ? 'mic' : 'file'} 
                            onChange={(e) => setUseMicInput(e.target.value === 'mic')}
                            style={{ 
                                padding: '8px 15px', 
                                fontSize: '16px', 
                                borderRadius: '5px',
                                backgroundColor: '#333',
                                color: 'white',
                                border: '1px solid #555',
                                    cursor: 'pointer',
                                    marginRight: '15px'
                            }}
                        >
                            <option value="mic">Microphone/Audio Interface</option>
                            <option value="file">Audio File (practiceSetup.wav)</option>
                        </select>
                            <label style={{ marginRight: '10px', fontSize: '16px' }}>
                                RNBO Patch:
                            </label>
                            <select 
                                value={rnboPatch} 
                                onChange={(e) => setRnboPatch(e.target.value)}
                                style={{ 
                                    padding: '8px 15px', 
                                    fontSize: '16px', 
                                    borderRadius: '5px',
                                    backgroundColor: '#333',
                                    color: 'white',
                                    border: '1px solid #555',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="overdrive">Overdrive</option>
                                <option value="filterdelay">Filter Delay</option>
                        </select>
                        </div>
                        {rnboPatch === 'overdrive' && (
                            <div style={{ 
                                padding: '10px', 
                                background: '#ff6b6b33', 
                                border: '1px solid #ff6b6b',
                                borderRadius: '5px',
                                fontSize: '14px',
                                textAlign: 'left'
                            }}>
                                ⚠️ <strong>Known Issue:</strong> The overdrive patch may not process input correctly (output stuck at constant level).
                                <br />Try the Filter Delay patch to test if the issue is patch-specific.
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={setupAudio} 
                        style={{ 
                            padding: '15px 30px', 
                            fontSize: '18px', 
                            cursor: 'pointer', 
                            backgroundColor: '#4CAF50', 
                            border: 'none', 
                            color: 'white', 
                            borderRadius: '5px' 
                        }}
                    >
                        Power On
                    </button>
                </div>
            ) : (
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <h3>Audio Active</h3>
                        <div style={{ margin: '15px 0', padding: '10px', background: '#333', borderRadius: '5px' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Input:</strong> {useMicInput ? 'Audio Interface' : 'Audio File'}
                                {isMicActive && <span style={{ color: '#4CAF50', marginLeft: '10px' }}>● Active</span>}
                            </div>
                            <button 
                                onClick={toggleInputSource}
                                style={{ 
                                    padding: '8px 20px', 
                                    fontSize: '14px', 
                                    cursor: 'pointer', 
                                    backgroundColor: '#555', 
                                    border: 'none', 
                                    color: 'white', 
                                    borderRadius: '5px',
                                    marginRight: '10px',
                                    marginTop: '5px'
                                }}
                            >
                                Switch to {useMicInput ? 'Audio File' : 'Microphone'}
                            </button>
                            <button 
                                onClick={stopAudio}
                                style={{ 
                                    padding: '8px 20px', 
                                    fontSize: '14px', 
                                    cursor: 'pointer', 
                                    backgroundColor: '#f44336', 
                                    border: 'none', 
                                    color: 'white', 
                                    borderRadius: '5px',
                                    marginTop: '5px'
                                }}
                            >
                                Stop
                            </button>
                            <div style={{ marginTop: '10px' }}>
                                <label style={{ fontSize: '12px', color: '#aaa', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={bypassRNBO}
                                        onChange={(e) => {
                                            const newBypass = e.target.checked;
                                            setBypassRNBO(newBypass);
                                            bypassRNBORef.current = newBypass;
                                            if (isLoaded) {
                                                // Restart audio with new bypass setting
                                                stopAudio();
                                                setTimeout(() => {
                                                    setupAudio();
                                                }, 100);
                                            }
                                        }}
                                        style={{ marginRight: '5px' }}
                                    />
                                    Test Mode: Bypass RNBO (verify audio input works)
                                </label>
                            </div>
                        </div>

                        {/* Audio Level Meter */}
                        {useMicInput && (
                            <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px',
                                    marginBottom: '5px'
                                }}>
                                    <span style={{ fontSize: '14px', minWidth: '100px' }}>Output Level:</span>
                                    <div style={{
                                        flex: 1,
                                        height: '20px',
                                        backgroundColor: '#444',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            width: `${audioLevel}%`,
                                            height: '100%',
                                            backgroundColor: audioLevel > 70 ? '#f44336' : audioLevel > 40 ? '#FFC107' : '#4CAF50',
                                            transition: 'width 0.1s ease',
                                            borderRadius: '10px'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '12px', minWidth: '40px', textAlign: 'right' }}>
                                        {audioLevel.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Amp Controls */}
                    <div style={{ 
                        marginTop: '20px', 
                        padding: '15px', 
                        background: '#333', 
                        borderRadius: '5px',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ textAlign: 'center', marginTop: 0, color: '#FFC107' }}>Amp Controls</h3>
                        
                        <div style={{ margin: '15px 0', padding: '10px', background: '#2a2a2a', borderRadius: '5px', border: '1px solid #555' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4CAF50' }}>
                                Input Gain: {inputGain.toFixed(1)}x ({(20 * Math.log10(inputGain)).toFixed(1)}dB)
                            </label>
                            <input 
                                type="range" 
                                min="0.1" max="5.0" step="0.1" 
                                value={inputGain} 
                                onChange={handleInputGainChange}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                Boosts input signal before RNBO processing. Increase if guitar is too quiet.
                            </div>
                        </div>
                        
                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Drive: {Math.round(drive)}%
                            </label>
                            <input 
                                type="range" 
                                min="0" max="100" step="0.1" 
                                value={drive} 
                                onChange={handleDriveChange}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                Controls distortion/overdrive amount
                            </div>
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Bass: {Math.round(bass)}%
                            </label>
                            <input 
                                type="range" 
                                min="0" max="100" step="0.1" 
                                value={bass} 
                                onChange={handleBassChange}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                Low frequency response
                            </div>
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Treble: {Math.round(treble)}%
                            </label>
                            <input 
                                type="range" 
                                min="0" max="100" step="0.1" 
                                value={treble} 
                                onChange={handleTrebleChange}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                High frequency response
                            </div>
                        </div>
                        
                        {/* FilterDelay-specific controls */}
                        {rnboPatch === 'filterdelay' && (
                            <>
                                <div style={{ margin: '15px 0', padding: '10px', background: '#2a2a2a', borderRadius: '5px', border: '1px solid #555' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#FFC107' }}>
                                        FilterDelay Controls
                                    </label>
                                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>
                                        Static disappears when you play = patch IS working! Adjust these to hear the processed guitar better.
                                    </div>
                        </div>

                        <div style={{ margin: '15px 0' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Time: {Math.round(time)}%
                                    </label>
                            <input 
                                type="range" 
                                        min="0" max="100" step="0.1" 
                                        value={time} 
                                        onChange={handleTimeChange}
                                        style={{ width: '100%', cursor: 'pointer' }}
                                    />
                                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                        Delay time
                                    </div>
                        </div>

                        <div style={{ margin: '15px 0' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Regen: {Math.round(regen)}%
                                    </label>
                            <input 
                                type="range" 
                                        min="0" max="100" step="0.1" 
                                        value={regen} 
                                        onChange={handleRegenChange}
                                        style={{ width: '100%', cursor: 'pointer' }}
                                    />
                                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                        Regeneration/feedback - increases effect intensity
                                    </div>
                        </div>

                        <div style={{ margin: '15px 0' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Color: {Math.round(color)}%
                                    </label>
                            <input 
                                type="range" 
                                        min="0" max="100" step="0.1" 
                                        value={color} 
                                        onChange={handleColorChange}
                                        style={{ width: '100%', cursor: 'pointer' }}
                                    />
                                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                        Filter color/tone
                                    </div>
                        </div>

                        <div style={{ margin: '15px 0' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Feedback: {fb.toFixed(2)}
                                    </label>
                            <input 
                                type="range" 
                                        min="0" max="1" step="0.01" 
                                        value={fb} 
                                        onChange={handleFbChange}
                                        style={{ width: '100%', cursor: 'pointer' }}
                                    />
                                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                        Feedback amount (0-1)
                        </div>
                                </div>
                            </>
                        )}

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Volume: {Math.round(volume)}%
                            </label>
                            <input 
                                type="range" 
                                min="0" max="100" step="0.1" 
                                value={volume} 
                                onChange={handleVolumeChange}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                Output volume (50% = unity gain)
                        </div>
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Mix: {Math.round(mix)}%
                            </label>
                            <input 
                                type="range" 
                                min="0" max="100" step="0.1" 
                                value={mix} 
                                onChange={handleMixChange}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                Dry/Wet mix (100% = fully processed)
                        </div>
                        </div>
                    </div>

                    <p style={{ color: '#888', marginTop: '20px' }}>
                        {useMicInput 
                            ? 'Live audio streaming through RNBO Overdrive amp simulator...' 
                            : 'Audio file looping through RNBO Overdrive amp simulator...'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default RNBOStreamDemo;
