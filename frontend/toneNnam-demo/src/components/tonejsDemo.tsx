import React, { useState, useEffect, useRef, FC } from 'react';

/**
 * PURE NATIVE WEB AUDIO API - No Tone.js
 * 
 * This uses only browser-native APIs:
 * - navigator.mediaDevices.getUserMedia (microphone access)
 * - AudioContext (audio processing)
 * - MediaStreamSourceNode (input)
 * - GainNode (volume control)
 * - WaveShaperNode (distortion)
 * - AnalyserNode (monitoring)
 * - AudioDestinationNode (output)
 */

const TonejsDemo: FC = () => {
  const [isOn, setIsOn] = useState<boolean>(false);
  const [distortionAmount, setDistortionAmount] = useState<number>(0.5);
  const [directMode, setDirectMode] = useState<boolean>(false); // Start with effects enabled
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [inputGain, setInputGain] = useState<number>(5.0); // Boost input signal (5x = +14dB)
  
  // Amp controls
  const [bassValue, setBassValue] = useState<number>(0); // dB
  const [midValue, setMidValue] = useState<number>(0); // dB
  const [trebleValue, setTrebleValue] = useState<number>(0); // dB
  const [reverbAmount, setReverbAmount] = useState<number>(0.3); // 0-1 wet/dry mix
  const [baseReverbAmount, setBaseReverbAmount] = useState<number>(0.3); // Normal reverb setting (when pedal not pressed)
  const [isPedalPressed, setIsPedalPressed] = useState<boolean>(false); // Spacebar pedal state
  const [volumeValue, setVolumeValue] = useState<number>(-6); // dB
  
  // Native Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const inputGainNodeRef = useRef<GainNode | null>(null);
  const distortionNodeRef = useRef<WaveShaperNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const reverbConvolverRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null); // Wet signal
  const dryGainRef = useRef<GainNode | null>(null); // Dry signal
  const masterVolumeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Create distortion curve function
  const makeDistortionCurve = (amount: number) => {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve as Float32Array;
  };

  // Generate reverb impulse response
  const generateReverbIR = (context: AudioContext, roomSize: number = 0.7): AudioBuffer => {
    const sampleRate = context.sampleRate;
    const length = Math.floor(sampleRate * roomSize * 2); // Longer for more reverb
    const impulse = context.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay with some resonance
        const decay = Math.exp(-i / (sampleRate * roomSize));
        const resonance = Math.sin(i * 2 * Math.PI * 100 / sampleRate) * 0.2;
        channelData[i] = (decay + resonance) * 0.1;
      }
    }
    
    return impulse;
  };

  // Toggle audio on/off
  const togglePower = async () => {
    if (!isOn) {
      // Turn ON
      try {
        console.log('▶️ Starting audio with native Web Audio API...');
        
        // Create AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContextClass();
        audioContextRef.current = context;
        
        // Resume context (required for browser autoplay policy)
        if (context.state === 'suspended') {
          await context.resume();
        }
        
        console.log(`📊 AudioContext state: ${context.state}`);
        console.log(`📊 Sample rate: ${context.sampleRate}Hz`);
        
        // Get microphone access
        console.log('🎤 Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
        mediaStreamRef.current = stream;
        
        console.log('✅ Microphone access granted');
        console.log(`📊 Audio tracks: ${stream.getAudioTracks().length}`);
        stream.getAudioTracks().forEach((track, i) => {
          console.log(`  Track ${i}: ${track.label}`);
          console.log(`    Enabled: ${track.enabled}, Muted: ${track.muted}`);
          console.log(`    Settings:`, track.getSettings());
        });
        
        // Create audio nodes
        const source = context.createMediaStreamSource(stream);
        sourceNodeRef.current = source;
        
        // INPUT GAIN - boost the signal before processing
        const inputGainNode = context.createGain();
        inputGainNode.gain.value = inputGain;
        inputGainNodeRef.current = inputGainNode;
        
        // Analyser for monitoring
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;
        
        if (directMode) {
          // DIRECT MODE: source -> inputGain -> analyser -> destination
          source.connect(inputGainNode);
          inputGainNode.connect(analyser);
          inputGainNode.connect(context.destination);
          console.log(`✅ Direct mode: source -> inputGain(${inputGain}x) -> destination (no effects)`);
        } else {
          // EFFECTS MODE: Build full amp chain
          // source -> inputGain -> distortion -> EQ -> reverb (wet/dry) -> volume -> analyser -> destination
          
          // Distortion
          const distortion = context.createWaveShaper();
          (distortion as any).curve = makeDistortionCurve(distortionAmount * 100);
          distortion.oversample = '4x';
          distortionNodeRef.current = distortion;
          
          // EQ - Bass (low shelf at 250Hz)
          const bassFilter = context.createBiquadFilter();
          bassFilter.type = 'lowshelf';
          bassFilter.frequency.value = 250;
          bassFilter.gain.value = bassValue;
          bassFilterRef.current = bassFilter;
          
          // EQ - Mid (peaking at 1000Hz)
          const midFilter = context.createBiquadFilter();
          midFilter.type = 'peaking';
          midFilter.frequency.value = 1000;
          midFilter.Q.value = 1;
          midFilter.gain.value = midValue;
          midFilterRef.current = midFilter;
          
          // EQ - Treble (high shelf at 4000Hz)
          const trebleFilter = context.createBiquadFilter();
          trebleFilter.type = 'highshelf';
          trebleFilter.frequency.value = 4000;
          trebleFilter.gain.value = trebleValue;
          trebleFilterRef.current = trebleFilter;
          
          // Reverb - create impulse response
          const reverbIR = generateReverbIR(context, 0.7);
          const reverbConvolver = context.createConvolver();
          reverbConvolver.buffer = reverbIR;
          reverbConvolverRef.current = reverbConvolver;
          
          // Reverb wet/dry mix
          const reverbGain = context.createGain();
          reverbGain.gain.value = isPedalPressed ? 0.95 : reverbAmount; // Use pedal state if active
          reverbGainRef.current = reverbGain;
          
          const dryGain = context.createGain();
          dryGain.gain.value = isPedalPressed ? 0.05 : (1 - reverbAmount); // Use pedal state if active
          dryGainRef.current = dryGain;
          
          // Master volume
          const masterVolume = context.createGain();
          masterVolume.gain.value = Math.pow(10, volumeValue / 20); // Convert dB to linear
          masterVolumeRef.current = masterVolume;
          
          // Connect the chain: source -> inputGain -> distortion -> EQ -> split -> reverb/dry -> volume -> analyser -> destination
          source.connect(inputGainNode);
          inputGainNode.connect(distortion);
          distortion.connect(bassFilter);
          bassFilter.connect(midFilter);
          midFilter.connect(trebleFilter);
          
          // Split for reverb wet/dry
          trebleFilter.connect(dryGain);
          trebleFilter.connect(reverbConvolver);
          reverbConvolver.connect(reverbGain);
          
          // Merge wet and dry
          const merger = context.createChannelMerger(2);
          dryGain.connect(merger, 0, 0);
          reverbGain.connect(merger, 0, 1);
          
          merger.connect(masterVolume);
          masterVolume.connect(analyser);
          masterVolume.connect(context.destination);
          
          console.log(`✅ Effects mode: Full amp chain connected`);
          console.log(`   Chain: inputGain(${inputGain}x) -> distortion(${distortionAmount}) -> EQ(bass:${bassValue}dB, mid:${midValue}dB, treble:${trebleValue}dB) -> reverb(${reverbAmount}) -> volume(${volumeValue}dB)`);
        }
        
        setIsOn(true);
        console.log('✅ Audio ON - You should hear your guitar now!');
        
        // Test audio level after 1 second
        setTimeout(() => {
          if (analyserRef.current) {
            const data = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(data);
            const avg = data.reduce((a, b) => a + b) / data.length;
            const max = Math.max(...data);
            console.log(`📊 Native audio test (after 1s): avg=${avg.toFixed(1)}/255, max=${max}`);
            if (avg < 1 && max < 5) {
              console.error('❌ CRITICAL: No audio signal detected!');
              console.error('❌ Check: Focusrite input gain, guitar volume, cable connection');
            } else {
              console.log('✅ Audio signal detected!');
            }
          }
        }, 1000);
        
      } catch (error: any) {
        console.error('❌ Failed to start audio:', error);
        alert(`Failed to access microphone: ${error.message}\n\nPlease check:\n1. Browser permissions\n2. Microphone is connected\n3. No other app is using the microphone`);
      }
    } else {
      // Turn OFF
      console.log('⏹️ Stopping audio...');
      
      // Stop all tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      
      // Disconnect all nodes
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (inputGainNodeRef.current) {
        inputGainNodeRef.current.disconnect();
        inputGainNodeRef.current = null;
      }
      if (distortionNodeRef.current) {
        distortionNodeRef.current.disconnect();
        distortionNodeRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      
      // Close AudioContext
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      setIsOn(false);
      setAudioLevel(0);
      console.log('✅ Audio OFF');
    }
  };

  // Rebuild audio chain when direct mode changes (full rebuild needed)
  useEffect(() => {
    if (!isOn || !sourceNodeRef.current || !audioContextRef.current) return;
    
    const context = audioContextRef.current;
    
    console.log(`🔗 Rebuilding audio chain (direct mode: ${directMode})`);
    
    // Disconnect everything
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }
    if (inputGainNodeRef.current) {
      inputGainNodeRef.current.disconnect();
      inputGainNodeRef.current = null;
    }
    if (distortionNodeRef.current) {
      distortionNodeRef.current.disconnect();
      distortionNodeRef.current = null;
    }
    if (bassFilterRef.current) {
      bassFilterRef.current.disconnect();
      bassFilterRef.current = null;
    }
    if (midFilterRef.current) {
      midFilterRef.current.disconnect();
      midFilterRef.current = null;
    }
    if (trebleFilterRef.current) {
      trebleFilterRef.current.disconnect();
      trebleFilterRef.current = null;
    }
    if (reverbConvolverRef.current) {
      reverbConvolverRef.current.disconnect();
      reverbConvolverRef.current = null;
    }
    if (reverbGainRef.current) {
      reverbGainRef.current.disconnect();
      reverbGainRef.current = null;
    }
    if (dryGainRef.current) {
      dryGainRef.current.disconnect();
      dryGainRef.current = null;
    }
    if (masterVolumeRef.current) {
      masterVolumeRef.current.disconnect();
      masterVolumeRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
    }
    
    // Recreate input gain
    const inputGainNode = context.createGain();
    inputGainNode.gain.value = inputGain;
    inputGainNodeRef.current = inputGainNode;
    
    if (directMode) {
      // DIRECT MODE: source -> inputGain -> analyser -> destination
      sourceNodeRef.current!.connect(inputGainNode);
      inputGainNode.connect(analyserRef.current!);
      inputGainNode.connect(context.destination);
      console.log(`✅ Direct mode: source -> inputGain(${inputGain}x) -> destination (no effects)`);
    } else {
      // EFFECTS MODE: Full amp chain
      const distortion = context.createWaveShaper();
      (distortion as any).curve = makeDistortionCurve(distortionAmount * 100);
      distortion.oversample = '4x';
      distortionNodeRef.current = distortion;
      
      const bassFilter = context.createBiquadFilter();
      bassFilter.type = 'lowshelf';
      bassFilter.frequency.value = 250;
      bassFilter.gain.value = bassValue;
      bassFilterRef.current = bassFilter;
      
      const midFilter = context.createBiquadFilter();
      midFilter.type = 'peaking';
      midFilter.frequency.value = 1000;
      midFilter.Q.value = 1;
      midFilter.gain.value = midValue;
      midFilterRef.current = midFilter;
      
      const trebleFilter = context.createBiquadFilter();
      trebleFilter.type = 'highshelf';
      trebleFilter.frequency.value = 4000;
      trebleFilter.gain.value = trebleValue;
      trebleFilterRef.current = trebleFilter;
      
      const reverbIR = generateReverbIR(context, 0.7);
      const reverbConvolver = context.createConvolver();
      reverbConvolver.buffer = reverbIR;
      reverbConvolverRef.current = reverbConvolver;
      
      const reverbGain = context.createGain();
      reverbGain.gain.value = isPedalPressed ? 0.95 : baseReverbAmount; // Use pedal state if active
      reverbGainRef.current = reverbGain;
      
      const dryGain = context.createGain();
      dryGain.gain.value = isPedalPressed ? 0.05 : (1 - baseReverbAmount); // Use pedal state if active
      dryGainRef.current = dryGain;
      
      const masterVolume = context.createGain();
      masterVolume.gain.value = Math.pow(10, volumeValue / 20);
      masterVolumeRef.current = masterVolume;
      
      // Connect chain
      sourceNodeRef.current!.connect(inputGainNode);
      inputGainNode.connect(distortion);
      distortion.connect(bassFilter);
      bassFilter.connect(midFilter);
      midFilter.connect(trebleFilter);
      trebleFilter.connect(dryGain);
      trebleFilter.connect(reverbConvolver);
      reverbConvolver.connect(reverbGain);
      
      const merger = context.createChannelMerger(2);
      dryGain.connect(merger, 0, 0);
      reverbGain.connect(merger, 0, 1);
      merger.connect(masterVolume);
      masterVolume.connect(analyserRef.current!);
      masterVolume.connect(context.destination);
      
      console.log(`✅ Effects mode: Full amp chain rebuilt`);
    }
  }, [directMode, isOn, inputGain, distortionAmount, bassValue, midValue, trebleValue, baseReverbAmount, isPedalPressed, volumeValue]);

  // Update input gain when slider changes
  useEffect(() => {
    if (inputGainNodeRef.current && isOn) {
      inputGainNodeRef.current.gain.value = inputGain;
      console.log(`🎛️ Input gain updated to: ${inputGain}x (${(20 * Math.log10(inputGain)).toFixed(1)}dB)`);
    }
  }, [inputGain, isOn]);

  // Update distortion when slider changes
  useEffect(() => {
    if (distortionNodeRef.current && !directMode && isOn) {
      (distortionNodeRef.current as any).curve = makeDistortionCurve(distortionAmount * 100);
      console.log(`🎛️ Distortion updated to: ${distortionAmount}`);
    }
  }, [distortionAmount, directMode, isOn]);

  // Update EQ when sliders change
  useEffect(() => {
    if (bassFilterRef.current && !directMode && isOn) {
      bassFilterRef.current.gain.value = bassValue;
      console.log(`🎛️ Bass EQ updated to: ${bassValue}dB`);
    }
  }, [bassValue, directMode, isOn]);

  useEffect(() => {
    if (midFilterRef.current && !directMode && isOn) {
      midFilterRef.current.gain.value = midValue;
      console.log(`🎛️ Mid EQ updated to: ${midValue}dB`);
    }
  }, [midValue, directMode, isOn]);

  useEffect(() => {
    if (trebleFilterRef.current && !directMode && isOn) {
      trebleFilterRef.current.gain.value = trebleValue;
      console.log(`🎛️ Treble EQ updated to: ${trebleValue}dB`);
    }
  }, [trebleValue, directMode, isOn]);

  // Update base reverb when slider changes (only if pedal is not pressed)
  useEffect(() => {
    if (!isPedalPressed) {
      setBaseReverbAmount(reverbAmount);
    }
  }, [reverbAmount, isPedalPressed]);

  // Update reverb audio nodes when pedal state or base reverb changes
  useEffect(() => {
    if (reverbGainRef.current && dryGainRef.current && !directMode && isOn) {
      const currentReverb = isPedalPressed ? 0.95 : baseReverbAmount; // High reverb when pedal pressed
      reverbGainRef.current.gain.value = currentReverb;
      dryGainRef.current.gain.value = 1 - currentReverb;
      console.log(`🎛️ Reverb updated to: ${(currentReverb * 100).toFixed(0)}% wet${isPedalPressed ? ' (PEDAL PRESSED)' : ''}`);
    }
  }, [baseReverbAmount, isPedalPressed, directMode, isOn]);

  // Spacebar pedal: increase reverb when spacebar is pressed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only activate if spacebar and not already pressed
      if (event.code === 'Space' && !isPedalPressed && !directMode && isOn) {
        event.preventDefault(); // Prevent page scroll
        setIsPedalPressed(true);
        console.log('🎹 PEDAL PRESSED - Reverb increased!');
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Only deactivate if spacebar and currently pressed
      if (event.code === 'Space' && isPedalPressed) {
        event.preventDefault(); // Prevent page scroll
        setIsPedalPressed(false);
        console.log('🎹 PEDAL RELEASED - Reverb back to normal');
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPedalPressed, directMode, isOn]);

  // Update master volume when slider changes
  useEffect(() => {
    if (masterVolumeRef.current && !directMode && isOn) {
      masterVolumeRef.current.gain.value = Math.pow(10, volumeValue / 20);
      console.log(`🎛️ Master volume updated to: ${volumeValue}dB`);
    }
  }, [volumeValue, directMode, isOn]);

  // Monitor audio levels - using both time domain (peak) and frequency domain (RMS)
  useEffect(() => {
    if (!isOn || !analyserRef.current) return;
    
    let animationFrame: number;
    const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
    const timeData = new Uint8Array(analyserRef.current.fftSize);
    
    const checkLevel = () => {
      if (analyserRef.current && isOn) {
        // Get frequency domain data (for overall signal strength)
        analyserRef.current.getByteFrequencyData(freqData);
        const freqAvg = freqData.reduce((a, b) => a + b) / freqData.length;
        const freqMax = Math.max(...freqData);
        
        // Get time domain data (for peak detection - better for transient guitar signals)
        analyserRef.current.getByteTimeDomainData(timeData);
        
        // Calculate RMS (Root Mean Square) from time domain - more accurate for audio levels
        let sumSquares = 0;
        for (let i = 0; i < timeData.length; i++) {
          // Convert 0-255 to -1 to 1 range
          const normalized = (timeData[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / timeData.length);
        
        // Calculate peak from time domain
        let peak = 0;
        for (let i = 0; i < timeData.length; i++) {
          const normalized = Math.abs((timeData[i] - 128) / 128);
          if (normalized > peak) peak = normalized;
        }
        
        // Use the higher of RMS or peak, scaled appropriately
        // RMS is more accurate for continuous signals, peak is better for transients
        const level = Math.max(rms * 100, peak * 80); // Peak gets 80% weight, RMS gets 100%
        
        // Also consider frequency domain max for very strong signals
        const freqLevel = (freqMax / 255) * 100;
        
        // Take the maximum of all measurements for the most sensitive meter
        const finalLevel = Math.min(100, Math.max(level, freqLevel * 0.7));
        
        setAudioLevel(finalLevel);
        
        // Log every 60 frames (~1 second)
        if (Math.random() < 0.016) {
          console.log(`📊 Audio levels - RMS: ${(rms * 100).toFixed(1)}%, Peak: ${(peak * 100).toFixed(1)}%, Freq Max: ${freqMax}/255, Final: ${finalLevel.toFixed(1)}%`);
          if (finalLevel < 10) {
            console.warn('⚠️ Very low audio level - check your guitar/interface input gain!');
          } else if (finalLevel > 90) {
            console.warn('⚠️ Very high audio level - watch for clipping!');
          }
        }
        
        animationFrame = requestAnimationFrame(checkLevel);
      }
    };
    
    checkLevel();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isOn]);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>Native Web Audio API Amp Demo</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>Using pure browser APIs - no Tone.js</p>
      
      {/* Power Button */}
      <button
        onClick={togglePower}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: isOn ? '#ff4444' : '#44ff44',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {isOn ? 'OFF' : 'ON'}
      </button>

      {/* Status */}
      <div style={{ marginBottom: '20px' }}>
        <p>Status: <strong>{isOn ? '🟢 Running' : '🔴 Stopped'}</strong></p>
        
        {/* Audio Level Meter */}
        {isOn && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '5px'
            }}>
              <span style={{ fontSize: '14px', minWidth: '80px' }}>Audio Level:</span>
              <div style={{
                flex: 1,
                height: '20px',
                backgroundColor: '#ddd',
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
            <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
              {audioLevel < 5 ? '⚠️ No audio detected - check your guitar/interface!' : 
               audioLevel < 20 ? '⚠️ Low audio level - turn up input gain' :
               '✅ Audio detected'}
            </div>
          </div>
        )}
      </div>

      {/* Input Gain Control - Always show when ON */}
      {isOn && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Input Gain: {inputGain.toFixed(1)}x ({(20 * Math.log10(inputGain)).toFixed(1)}dB)
          </label>
          <input
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            value={inputGain}
            onChange={(e) => setInputGain(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Boost your guitar signal before processing. Higher = louder input (but watch for clipping!)
          </div>
        </div>
      )}

      {/* Direct Mode Toggle */}
      {isOn && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={directMode}
              onChange={(e) => setDirectMode(e.target.checked)}
              style={{ marginRight: '10px', width: '20px', height: '20px' }}
            />
            <div>
              <strong>Direct Mode (No Effects)</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {directMode 
                  ? '✅ Bypassing all effects - you should hear clean guitar signal'
                  : '🎛️ Effects enabled - distortion is active'}
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Amp Controls - Only show when effects are enabled */}
      {isOn && !directMode && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Amp Controls</h3>
          
          {/* Distortion */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Distortion: {distortionAmount.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={distortionAmount}
              onChange={(e) => setDistortionAmount(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* EQ Section */}
          <div style={{ marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '14px' }}>EQ</h4>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Bass: {bassValue > 0 ? '+' : ''}{bassValue.toFixed(1)} dB
              </label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={bassValue}
                onChange={(e) => setBassValue(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Mid: {midValue > 0 ? '+' : ''}{midValue.toFixed(1)} dB
              </label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={midValue}
                onChange={(e) => setMidValue(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Treble: {trebleValue > 0 ? '+' : ''}{trebleValue.toFixed(1)} dB
              </label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={trebleValue}
                onChange={(e) => setTrebleValue(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Reverb */}
          <div style={{ marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Reverb: {(isPedalPressed ? 95 : reverbAmount * 100).toFixed(0)}% wet
              {isPedalPressed && <span style={{ color: '#4CAF50', fontWeight: 'bold', marginLeft: '10px' }}>🎹 PEDAL ACTIVE</span>}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={reverbAmount}
              onChange={(e) => setReverbAmount(parseFloat(e.target.value))}
              style={{ width: '100%' }}
              disabled={isPedalPressed}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              💡 <strong>Tip:</strong> Hold <strong>SPACEBAR</strong> for maximum reverb (sustain pedal effect)
            </div>
          </div>

          {/* Master Volume */}
          <div style={{ paddingTop: '15px', borderTop: '1px solid #ddd' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Master Volume: {volumeValue.toFixed(1)} dB
            </label>
            <input
              type="range"
              min="-60"
              max="0"
              step="1"
              value={volumeValue}
              onChange={(e) => setVolumeValue(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '5px' 
      }}>
        <h3>How to Test:</h3>
        <ol>
          <li>Click <strong>ON</strong> button (browser will ask for microphone permission)</li>
          <li>Allow microphone access</li>
          <li><strong>Check the Audio Level meter</strong> - it should show activity when you play</li>
          <li>Play your guitar - you should hear it through your speakers (clean, no effects)</li>
          <li>Uncheck "Direct Mode" to enable distortion</li>
          <li>Adjust the distortion slider - you should hear the sound change</li>
        </ol>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          <strong>If you don't hear anything:</strong><br/>
          • Check browser console for errors<br/>
          • Make sure your Focusrite input gain is turned up<br/>
          • Check Windows Sound Settings - input device should be Focusrite<br/>
          • Try a different browser (Chrome usually works best)
        </p>
      </div>
    </div>
  );
};

export default TonejsDemo;
