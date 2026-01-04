import React, { useRef, useState, useEffect } from 'react';
import { createDevice, ParameterNotificationSetting } from '@rnbo/js';

const RNBOStreamDemo = () => {
    const audioContextRef = useRef(null);
    const deviceRef = useRef(null);
    const sourceNodeRef = useRef(null);
    
    // Input streaming refs (from toneNnam-demo approach)
    const mediaStreamRef = useRef(null);
    const mediaStreamSourceRef = useRef(null);
    const analyserRef = useRef(null);
    
    const [isLoaded, setIsLoaded] = useState(false);
    const [useMicInput, setUseMicInput] = useState(true); // Default to mic input
    const [isMicActive, setIsMicActive] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    
    // RNBO parameters (from Testing_RNBO)
    const [time, setTime] = useState(75);
    const [scale, setScale] = useState(0);
    const [color, setColor] = useState(0);
    const [volume, setVolume] = useState(50);
    const [mix, setMix] = useState(50);
    const [spread, setSpread] = useState(0);
    const [filter, setFilter] = useState(0.5);
    const [regen, setRegen] = useState(50);
    const [fb, setFb] = useState(0.5);

    // Setup microphone input (from toneNnam-demo)
    const setupMicInput = async (context) => {
        try {
            console.log('🎤 Requesting microphone access...');
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
            console.log('✅ Audio interface connected');
            return mediaStreamSource;
        } catch (err) {
            console.error('❌ Audio interface access error:', err);
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
        console.log('🔴 Audio interface disconnected');
    };

    // Setup audio with RNBO processing
    const setupAudio = async () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const context = new AudioContextClass();
            audioContextRef.current = context;

            // Resume context (required for browser autoplay policy)
            if (context.state === 'suspended') {
                await context.resume();
            }

            console.log(`📊 AudioContext state: ${context.state}`);
            console.log(`📊 Sample rate: ${context.sampleRate}Hz`);

            // Create Gain node for output volume control
            const gainNode = context.createGain();
            gainNode.gain.value = 1.0;

            // Create analyser for audio level monitoring
            const analyser = context.createAnalyser();
            analyser.fftSize = 2048;
            analyserRef.current = analyser;

            // Determine audio source (mic or file)
            let audioSource = null;
            
            if (useMicInput) {
                // Use microphone input streaming
                audioSource = await setupMicInput(context);
            } else {
                // Use WAV file playback
                console.log('📁 Loading audio file...');
                const audioResponse = await fetch('/audio/practiceSetup.wav');
                const arrayBuffer = await audioResponse.arrayBuffer(); 
                const audioBuffer = await context.decodeAudioData(arrayBuffer);
                
                const source = context.createBufferSource();
                source.buffer = audioBuffer;
                source.loop = true;
                audioSource = source;
            }

            // Load RNBO device
            console.log('🎛️ Loading RNBO device...');
            const response = await fetch('/export/rnbo.filterdelay.json');
            const patcher = await response.json();

            const device = await createDevice({
                context: context,
                options: {
                    parameterNotificationSetting: ParameterNotificationSetting.All
                }, 
                patcher: patcher
            });

            deviceRef.current = device;

            // Load a preset from the patcher
            let presets = patcher.presets || [];
            if (presets.length > 0) {
                device.setPreset(presets[6].preset || presets[0].preset);
            }

            // Connect audio chain: source -> RNBO device -> analyser -> gain -> destination
            audioSource.connect(device.node);
            device.node.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(context.destination);

            // Start playback if using file source
            if (!useMicInput && audioSource.start) {
                audioSource.start();
            }
            
            sourceNodeRef.current = audioSource;
            
            setIsLoaded(true);
            console.log(`✅ Audio setup complete - ${useMicInput ? 'Live Input' : 'File Playback'} through RNBO`);
            console.log('Available parameters:', device.parameters.map(p => p.id));

        } catch (err) {
            console.error('❌ Audio setup failed:', err);
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
            
            // Reset and restart with new source
            setIsLoaded(false);
            setTimeout(() => {
                setupAudio();
            }, 100);
        }
    };

    // Stop audio
    const stopAudio = async () => {
        console.log('⏹️ Stopping audio...');
        
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
        console.log('✅ Audio stopped');
    };

    // RNBO parameter handlers
    const updateRNBOParam = (paramId, value) => {
        if (deviceRef.current) {
            const param = deviceRef.current.parametersById.get(paramId);
            if (param) {
                param.value = value;
                console.log(`🎛️ RNBO param ${paramId} = ${value}`);
            } else {
                console.warn(`Parameter '${paramId}' not found in RNBO device!`);
            }
        }
    };

    const handleTimeChange = (e) => {
        const val = parseFloat(e.target.value);
        setTime(val);
        updateRNBOParam('time', val);
    };

    const handleScaleChange = (e) => {
        const val = parseFloat(e.target.value);
        setScale(val);
        updateRNBOParam('scale', val);
    };

    const handleColorChange = (e) => {
        const val = parseFloat(e.target.value);
        setColor(val);
        updateRNBOParam('color', val);
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        updateRNBOParam('volume', val);
    };

    const handleMixChange = (e) => {
        const val = parseFloat(e.target.value);
        setMix(val);
        updateRNBOParam('mix', val);
    };

    const handleSpreadChange = (e) => {
        const val = parseFloat(e.target.value);
        setSpread(val);
        updateRNBOParam('spread', val);
    };

    const handleFilterChange = (e) => {
        const val = parseFloat(e.target.value);
        setFilter(val);
        updateRNBOParam('filter', val);
    };

    const handleRegenChange = (e) => {
        const val = parseFloat(e.target.value);
        setRegen(val);
        updateRNBOParam('regen', val);
    };

    const handleFBChange = (e) => {
        const val = parseFloat(e.target.value);
        setFb(val);
        updateRNBOParam('fb', val);
    };

    // Monitor audio levels (from toneNnam-demo)
    useEffect(() => {
        if (!isLoaded || !analyserRef.current) return;
        
        let animationFrame;
        const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
        const timeData = new Uint8Array(analyserRef.current.fftSize);
        
        const checkLevel = () => {
            if (analyserRef.current && isLoaded) {
                analyserRef.current.getByteFrequencyData(freqData);
                const freqAvg = freqData.reduce((a, b) => a + b) / freqData.length;
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
                
                setAudioLevel(finalLevel);
                
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
            <h1>🎸 RNBO Stream Demo</h1>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>
                Live audio input streaming + RNBO processing
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
                        🔌 Power On
                    </button>
                </div>
            ) : (
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <h3>✅ Audio Active</h3>
                        <div style={{ margin: '15px 0', padding: '10px', background: '#333', borderRadius: '5px' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Input:</strong> {useMicInput ? '🎤 Audio Interface' : '📁 Audio File'}
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
                                ⏹️ Stop
                            </button>
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
                                    <span style={{ fontSize: '14px', minWidth: '100px' }}>Audio Level:</span>
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
                                            backgroundColor: audioLevel > 50 ? '#4CAF50' : audioLevel > 20 ? '#FFC107' : '#f44336',
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

                    {/* RNBO Controls */}
                    <div style={{ 
                        marginTop: '20px', 
                        padding: '15px', 
                        background: '#333', 
                        borderRadius: '5px',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ textAlign: 'center', marginTop: 0 }}>🎛️ RNBO Controls</h3>
                        
                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Time: {Math.round(time)}%</label>
                            <input 
                                type="range" 
                                min="0" max="100" step="0.01" 
                                value={time} 
                                onChange={handleTimeChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Scale: {Math.round(scale)}</label>
                            <input 
                                type="range" 
                                min="0" max="6" step="0.01" 
                                value={scale} 
                                onChange={handleScaleChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Color: {Math.round(color)}%</label>
                            <input 
                                type="range" 
                                min="0" max="100" step="0.01" 
                                value={color} 
                                onChange={handleColorChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Volume: {Math.round(volume)}%</label>
                            <input 
                                type="range" 
                                min="-100" max="100" step="0.01" 
                                value={volume} 
                                onChange={handleVolumeChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Mix: {Math.round(mix)}%</label>
                            <input 
                                type="range" 
                                min="0" max="100" step="0.01" 
                                value={mix} 
                                onChange={handleMixChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Spread: {Math.round(spread)}%</label>
                            <input 
                                type="range" 
                                min="-100" max="100" step="0.01" 
                                value={spread} 
                                onChange={handleSpreadChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Filter: {Math.round(filter * 100)}%</label>
                            <input 
                                type="range" 
                                min="0" max="4" step="0.01" 
                                value={filter} 
                                onChange={handleFilterChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Regen: {Math.round(regen)}%</label>
                            <input 
                                type="range" 
                                min="0" max="100" step="0.01" 
                                value={regen} 
                                onChange={handleRegenChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>FB: {Math.round(fb * 100)}%</label>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.1" 
                                value={fb} 
                                onChange={handleFBChange}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <p style={{ color: '#888', marginTop: '20px' }}>
                        {useMicInput 
                            ? '🎤 Live audio streaming through RNBO filter delay...' 
                            : '📁 Audio file looping through RNBO filter delay...'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default RNBOStreamDemo;

