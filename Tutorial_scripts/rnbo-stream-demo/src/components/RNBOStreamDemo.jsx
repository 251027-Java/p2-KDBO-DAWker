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
    
    // Debug: track if device is ready
    const [deviceReady, setDeviceReady] = useState(false);

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

            // Load RNBO overdrive device
            console.log('Loading RNBO overdrive device...');
            const response = await fetch('/export/rnbo.overdrive.json');
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

            // Set initial amp parameters (device is now ready)
            console.log('Setting initial amp parameters...');
            const driveParam = device.parametersById.get('drive');
            const lowcutParam = device.parametersById.get('lowcut');
            const highcutParam = device.parametersById.get('highcut');
            const volumeParam = device.parametersById.get('volume');
            const mixParam = device.parametersById.get('mix');
            
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
                // Set volume to a safe level (around 0 = unity gain in -100 to 100 range)
                const safeVol = 0; // Unity gain
                volumeParam.value = Math.max(range.min, Math.min(range.max, safeVol));
                console.log(`✓ Volume set to safe level: ${volumeParam.value} (range: ${range.min}-${range.max})`);
            }
            
            console.log('Initial parameters summary:', {
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
            
            // Create a gain node for output volume control (safety)
            const outputGain = context.createGain();
            outputGain.gain.value = 1.0; // Unity gain
            
            // Connect audio chain: source -> RNBO device -> output gain -> analyser -> destination
            // This ensures RNBO processes the audio before it reaches the output
            // Note: analyser reads AFTER RNBO processing to show output level
            
            try {
                if (bypassRNBORef.current) {
                    // TEST MODE: Bypass RNBO to verify audio input works
                    console.log('⚠ TEST MODE: Bypassing RNBO - connecting source directly to output');
                    audioSource.connect(analyser);
                    analyser.connect(context.destination);
                    console.log('✅ Connected audioSource -> analyser -> destination (RNBO bypassed)');
                    console.log('💡 If you hear audio now, the issue is with RNBO processing, not audio input');
                } else {
                    // NORMAL MODE: Connect through RNBO
                    // Connect source to RNBO device input
                    audioSource.connect(device.node);
                    console.log('✅ Connected audioSource to device.node');
                    
                    // Connect RNBO device output to gain -> analyser -> destination
                    device.node.connect(outputGain);
                    outputGain.connect(analyser);
                    analyser.connect(context.destination);
                    console.log('✅ Connected device.node -> outputGain -> analyser -> destination');
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
    const handleDriveChange = (e) => {
        const val = parseFloat(e.target.value);
        setDrive(val);
        if (deviceReady && deviceRef.current) {
            updateRNBOParam('drive', val);
        }
    };

    const handleBassChange = (e) => {
        const val = parseFloat(e.target.value);
        setBass(val);
        if (deviceReady && deviceRef.current) {
            // Invert: more bass = less lowcut filtering
            updateRNBOParam('lowcut', 100 - val);
        }
    };

    const handleTrebleChange = (e) => {
        const val = parseFloat(e.target.value);
        setTreble(val);
        if (deviceReady && deviceRef.current) {
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
                                cursor: 'pointer'
                            }}
                        >
                            <option value="mic">Microphone/Audio Interface</option>
                            <option value="file">Audio File (practiceSetup.wav)</option>
                        </select>
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
