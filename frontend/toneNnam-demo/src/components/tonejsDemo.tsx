import React, { useState, useEffect, useRef, FC } from 'react';
import * as Tone from 'tone';
import { useCabinet } from './useCabinet';
import { usePedal } from './usePedal';
import { useNAMAmp } from './useNAMAmp';
import { NAMNode } from './NAMAudioWorklet';

// Standard Web Audio Type reinforcement
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Define props for the internal Control component
interface ControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  unit?: string;
}

const TonejsDemo: FC = () => {
  const [isEngineStarted, setIsEngineStarted] = useState<boolean>(false);
  const [useDirectMode, setUseDirectMode] = useState<boolean>(false); // this is to test low latency
  const [testDistortionOnly, setTestDistortionOnly] = useState<boolean>(false); // TEST MODE: bypass everything except distortion

  // all the state variables for the amp simulation controls
  const [distortionValue, setDistortionValue] = useState<number>(0.7); // controls the gain applied to signal (increased for more noticeable effect)
  const [bassValue, setBassValue] = useState<number>(0); // controls the bass frequency band in the EQ
  const [midValue, setMidValue] = useState<number>(0); // controls the mid frequency band in the EQ
  const [trebleValue, setTrebleValue] = useState<number>(0); // controls the treble frequency band in the EQ
  const [volumeValue, setVolumeValue] = useState<number>(0); // dB value (increased from -6 to 0 for more audible output)
  const [reverbValue, setReverbValue] = useState<number>(0.3); // controls the wet/dry mix (0.3 = 30% wet, 70% dry - allows original signal to be heard)
  
  // pedal
  const [pedalEnabled, setPedalEnabled] = useState<boolean>(true);
  const [pedalReverbMix, setPedalReverbMix] = useState<number>(0.8); 
  const [pedalReverbRoomSize, setPedalReverbRoomSize] = useState<number>(0.9);
  
  // cabinet
  const [cabinetEnabled, setCabinetEnabled] = useState<boolean>(true);
  const [cabinetLowCut, setCabinetLowCut] = useState<number>(80); // Hz - removes sub-bass
  const [cabinetHighCut, setCabinetHighCut] = useState<number>(8000); // Hz - speaker roll-off
  const [cabinetPresence, setCabinetPresence] = useState<number>(0); // dB - mid-high frequency emphasis
  
  // NAM amp
  const [useNAMAmpEnabled, setUseNAMAmpEnabled] = useState<boolean>(false);
  // Default to the NAM file in the root of the project, or use the one in public folder
  const [namFilePath, setNamFilePath] = useState<string>('/Vox AC15CH Crunch Normal.nam');
  const [namInputGain, setNamInputGain] = useState<number>(1.0);
  const [namOutputGain, setNamOutputGain] = useState<number>(0.5);
  const [reverbReady, setReverbReady] = useState<boolean>(false);
  
  // NATIVE WEB AUDIO API REFS (primary implementation)
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const distortionNodeRef = useRef<WaveShaperNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  
  // Tone.js refs (keeping for compatibility/fallback)
  const mic = useRef<Tone.UserMedia | null>(null);
  const distortion = useRef<Tone.Distortion | null>(null);
  const eq = useRef<Tone.EQ3 | null>(null); // references the EQ3 node for bass mid treble (AMP)
  const volume = useRef<Tone.Volume | null>(null);
  const reverb = useRef<Tone.Reverb | null>(null); // spatial ambience/reverberation

  // pedal hook - comes before amp in signal chain
  const pedal = usePedal(pedalEnabled, pedalReverbMix, pedalReverbRoomSize);
  const getPedalNode = pedal.getPedalNode;

  // Cabinet hook - separate entity from amp
  const cabinet = useCabinet(cabinetEnabled, cabinetLowCut, cabinetHighCut, cabinetPresence);
  const getCabinetChain = cabinet.getChain;

  // NAM amp hook - replaces distortion + EQ when enabled
  const namAmp = useNAMAmp(useNAMAmpEnabled ? namFilePath : null, useNAMAmpEnabled);
  const getNAMAmpChain = namAmp.getAmpChain;

  useEffect(() => {
    // this is to test low latency
    Tone.getContext().lookAhead = 0.05;

    // grabs interface stream
    mic.current = new Tone.UserMedia();

    // Create custom distortion using Web Audio API WaveShaperNode
    // This is more reliable than Tone.js Distortion
    const audioContext = Tone.getContext().rawContext as AudioContext;
    const waveshaper = audioContext.createWaveShaper();
    
    // Create distortion curve function - make it MORE aggressive
    const makeDistortionCurve = (amount: number) => {
      const samples = 44100;
      const curve = new Float32Array(samples);
      const deg = Math.PI / 180;
      // Scale amount to make distortion more noticeable (multiply by 50-100)
      const scaledAmount = amount * 50; // Much more aggressive
      
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + scaledAmount) * x * 20 * deg) / (Math.PI + scaledAmount * Math.abs(x));
      }
      return curve;
    };
    
    waveshaper.curve = makeDistortionCurve(distortionValue);
    waveshaper.oversample = '4x';
    
    // Create input and output gain nodes to wrap the WaveShaper
    // Add a BOOST before distortion to make it more noticeable
    const inputGain = new Tone.Gain(5.0); // 5x boost = ~14dB - makes distortion VERY noticeable
    const outputGain = new Tone.Gain(0.2); // Reduce output to prevent clipping
    
    // Connect input -> waveshaper -> output using raw Web Audio API nodes
    // Get the underlying GainNode from Tone.js Gain objects
    // IMPORTANT: Tone.js Gain nodes expose their underlying node via _gainNode
    const inputGainNode = (inputGain as any)._gainNode as GainNode;
    const outputGainNode = (outputGain as any)._gainNode as GainNode;
    
    // CRITICAL: Disconnect any default connections first
    // Tone.js Gain nodes might auto-connect to destination
    try {
      inputGainNode.disconnect();
    } catch (e) {
      // Already disconnected
    }
    try {
      outputGainNode.disconnect();
    } catch (e) {
      // Already disconnected
    }
    
    // Connect: inputGain -> waveshaper -> outputGain
    // This creates the audio path: Tone.js input -> raw GainNode -> WaveShaper -> raw GainNode -> Tone.js output
    inputGainNode.connect(waveshaper);
    waveshaper.connect(outputGainNode);
    
    console.log(`WaveShaperNode connected: inputGain(${inputGainNode.gain.value}x) -> waveshaper -> outputGain(${outputGainNode.gain.value}x)`);
    
    // Create a wrapper object that acts like a Tone.js node
    const distortionWrapper = {
      input: inputGain,
      output: outputGain,
      connect: (destination: any) => outputGain.connect(destination),
      disconnect: () => {
        inputGainNode.disconnect();
        waveshaper.disconnect();
        outputGain.disconnect();
      },
      dispose: () => {
        inputGainNode.disconnect();
        waveshaper.disconnect();
        outputGainNode.disconnect();
        inputGain.dispose();
        outputGain.dispose();
      },
      _waveshaper: waveshaper,
      _makeCurve: makeDistortionCurve,
      distortion: distortionValue,
      numberOfInputs: 1,
      numberOfOutputs: 1
    };
    
    distortion.current = distortionWrapper as any;
    console.log(`Custom WaveShaper distortion created with value: ${distortionValue}, input boost: 5x, output: 0.2x`);

    // eq3 so you can control the bass mid treble (values in decibels)
    eq.current = new Tone.EQ3({
      low: bassValue,
      mid: midValue,
      high: trebleValue
    });
    
    volume.current = new Tone.Volume(volumeValue);
    
    // Reverb needs to be generated before use
    // Create reverb with proper options
    reverb.current = new Tone.Reverb({
      decay: 1.5,
      preDelay: 0.01,
      wet: reverbValue
    });

    // Generate reverb impulse response (required for reverb to work)
    // Store the promise so we can check if it's ready
    reverb.current.generate().then(() => {
      console.log('Reverb generated successfully');
      // Ensure wet value is set after generation
      if (reverb.current) {
        reverb.current.wet.value = reverbValue;
        console.log(`Reverb wet set to: ${reverbValue} after generation`);
      }
      setReverbReady(true);
    }).catch((err) => {
      console.error('Error generating reverb:', err);
      setReverbReady(false);
    });
    
    // cleanup function
    // just properly discs and disposes of nodes to prevent memory leaks
    return () => {
      if (mic.current) {
        mic.current.disconnect();  // disconnect from audio graph
        mic.current.dispose();      // release microphone resources
      }
      if (distortion.current) {
        if (typeof (distortion.current as any).dispose === 'function') {
          (distortion.current as any).dispose();
        }
      }
      if (eq.current) eq.current.dispose();
      if (volume.current) volume.current.dispose();
      if (reverb.current) reverb.current.dispose();
    };
  }, []);

  // mode switching and chain rebuilding
  useEffect(() => {
    if (!mic.current || !isEngineStarted) return;
    
    // Helper function to rebuild the chain
    const rebuildChain = async () => {
      // Disconnect all nodes first
      try {
        mic.current?.disconnect();
      } catch (e) {
        // Already disconnected
      }
      
        distortion.current?.disconnect();
        eq.current?.disconnect();
        reverb.current?.disconnect();
        volume.current?.disconnect();
      
      const pedalNode = getPedalNode();
      if (pedalNode) {
        try {
          (pedalNode as any).disconnect();
        } catch (e) {
          // ignore errors if already disconnected
        }
      }
      
      const cabinetChain = getCabinetChain();
      if (cabinetChain && cabinetEnabled) {
        cabinetChain.forEach(node => {
          if (node) {
            try {
              (node as any)?.disconnect();
            } catch (e) {
              // ignore errors if already disconnected
            }
          }
        });
      }
      
      // Also disconnect NAM amp nodes if they exist
      const namAmpChain = getNAMAmpChain();
      if (namAmpChain) {
        namAmpChain.forEach(node => {
          if (node) {
            try {
              (node as any)?.disconnect();
            } catch (e) {
              // ignore errors
            }
          }
        });
      }
      
      if (useDirectMode) {
        // Direct mode: mic -> output (bypass all effects)
        if (mic.current) {
          mic.current.connect(Tone.Destination);
        }
        console.log("Chain: Direct mode (no effects)");
      } else {
        // ULTRA SIMPLE TEST: Just mic -> Tone.js Distortion (max) -> output
        // This bypasses everything to test if distortion works at all
        if (mic.current) {
          console.log(`🔴 ULTRA SIMPLE TEST: mic -> distortion(max) -> output`);
          
          // Create a fresh Tone.js Distortion with maximum settings
          const testDistortion = new Tone.Distortion(1.0); // Maximum distortion
          (testDistortion as any).oversample = '4x';
          
          // Create a huge gain boost before distortion
          const boostGain = new Tone.Gain(10.0); // 10x = 20dB boost
          
          // Connect: mic -> boost -> distortion -> output
          mic.current.connect(boostGain);
          boostGain.connect(testDistortion);
          testDistortion.connect(Tone.Destination);
          
          console.log("🔴 ULTRA SIMPLE TEST: Chain connected! You should hear EXTREME distortion!");
          console.log("🔴 Chain: mic -> gain(10x) -> Tone.Distortion(1.0, 4x oversample) -> output");
          console.log("🔴 If you still don't hear distortion, the problem is NOT with the distortion node itself.");
          return; // Skip the rest of the chain for testing
        }
        
        // Full signal chain: mic -> pedal -> (NAM amp OR distortion+EQ) -> cabinet -> reverb -> volume -> output
        if (!mic.current) return;
        
        let currentOutput: Tone.ToneAudioNode = mic.current;
        
        // connect pedal 
        const currentPedalNode = getPedalNode();
        if (currentPedalNode && pedalEnabled) {
          currentOutput.connect(currentPedalNode as any);
          currentOutput = currentPedalNode as any;
          console.log("✓ Pedal connected");
        }
        
        // connect amp (either NAM or fallback distortion+EQ)
        const currentNamAmpChain = getNAMAmpChain();
        if (currentNamAmpChain && currentNamAmpChain.length > 0 && useNAMAmpEnabled) {
          // Use NAM amp
          const namNode = currentNamAmpChain[0];
          if (namNode && (namNode as NAMNode).input) {
            currentOutput.connect((namNode as NAMNode).input);
            currentOutput = (namNode as NAMNode).output;
            console.log("✓ NAM amp connected");
          }
        } else {
          // Use fallback distortion + EQ
          if (distortion.current && eq.current) {
            // CRITICAL: Ensure distortion value is set before connecting
            if ((distortion.current as any)._waveshaper) {
              // Custom WaveShaper distortion
              const waveshaper = (distortion.current as any)._waveshaper;
              const makeCurve = (distortion.current as any)._makeCurve;
              waveshaper.curve = makeCurve(distortionValue);
              (distortion.current as any).distortion = distortionValue;
              console.log(`Connecting custom WaveShaper distortion with value: ${distortionValue}`);
            } else {
              // Tone.js Distortion
              (distortion.current as any).distortion = distortionValue;
              console.log(`Connecting Tone.js distortion with value: ${distortionValue}`);
            }
            
            // Connect: currentOutput -> distortion -> EQ
            // Use the input/output properties of our custom node
            if ((distortion.current as any).input && (distortion.current as any).output) {
              // Custom node with input/output
              currentOutput.connect((distortion.current as any).input);
              (distortion.current as any).output.connect(eq.current);
              currentOutput = eq.current;
              
              // Verify the WaveShaperNode is actually connected
              const waveshaper = (distortion.current as any)._waveshaper;
              if (waveshaper) {
                const inputGain = (distortion.current as any).input;
                const outputGain = (distortion.current as any).output;
                console.log(`✓ Custom distortion (input/output) -> EQ connected`);
                console.log(`  WaveShaperNode: curve=${waveshaper.curve ? waveshaper.curve.length + ' samples' : 'null'}, oversample=${waveshaper.oversample}`);
                console.log(`  Input gain: ${(inputGain as any).gain?.value || 'unknown'}, Output gain: ${(outputGain as any).gain?.value || 'unknown'}`);
              } else {
                console.error(`⚠ WaveShaperNode not found in distortion wrapper!`);
              }
            } else {
              // Standard Tone.js node
              currentOutput.connect(distortion.current);
              distortion.current.connect(eq.current);
              currentOutput = eq.current;
              console.log(`✓ Tone.js distortion -> EQ connected`);
            }
            
            console.log("✓ Distortion + EQ connected", {
              distortionValue: distortion.current.distortion,
              distortionInputs: distortion.current.numberOfInputs,
              distortionOutputs: distortion.current.numberOfOutputs,
              eqInputs: eq.current.numberOfInputs,
              eqOutputs: eq.current.numberOfOutputs
            });
          } else {
            console.error("⚠ Distortion or EQ not available!", {
              distortion: !!distortion.current,
              eq: !!eq.current
            });
          }
        }
        
        // connect cabinet
        const currentCabinetChain = getCabinetChain();
        if (currentCabinetChain && cabinetEnabled && currentCabinetChain[0] && currentCabinetChain[3]) {
          currentOutput.connect(currentCabinetChain[0]);
          currentOutput = currentCabinetChain[3]; // output from cabinet's presence filter
          console.log("✓ Cabinet connected");
        }
        
        // Connect to volume and output
        // NOTE: Reverb wet/dry mix explanation:
        // - wet: 0 = 100% dry (no reverb, original signal)
        // - wet: 1 = 100% wet (only reverb tail, no original signal)
        // For best results, keep wet between 0.2-0.5 to hear both original and reverb
        if (reverb.current && volume.current && reverbReady) {
          // Connect through reverb (which mixes wet/dry based on reverbValue)
          currentOutput.connect(reverb.current);
          reverb.current.connect(volume.current);
          volume.current.connect(Tone.Destination);
          console.log("✓ Reverb + Volume connected", {
            reverbWet: reverb.current.wet.value,
            reverbDry: 1 - reverb.current.wet.value,
            volume: volume.current.volume.value,
            distortionValue: distortion.current?.distortion
          });
        } else if (volume.current) {
          // If reverb not ready, connect volume directly (bypass reverb temporarily)
          currentOutput.connect(volume.current);
          volume.current.connect(Tone.Destination);
          console.log("⚠ Reverb not ready, connecting volume directly", {
            volume: volume.current.volume.value,
            distortionValue: distortion.current?.distortion
          });
        } else {
          // Last resort: connect directly to output
          currentOutput.connect(Tone.Destination);
          console.log("⚠ Volume not available, connecting directly to output");
        }
        
        console.log("Chain connected:", {
          pedal: pedalEnabled && currentPedalNode ? 'enabled' : 'disabled',
          amp: useNAMAmpEnabled && currentNamAmpChain ? 'NAM' : 'fallback',
          cabinet: cabinetEnabled && currentCabinetChain ? 'enabled' : 'disabled',
          reverb: reverb.current ? 'ready' : 'not ready',
          volume: volume.current ? 'ready' : 'not ready',
          distortion: distortion.current ? 'ready' : 'not ready',
          eq: eq.current ? 'ready' : 'not ready',
          namLoaded: namAmp.isNAMLoaded,
          namError: namAmp.loadingError
        });
      }
    };
    
    rebuildChain();
  }, [useDirectMode, isEngineStarted, pedalEnabled, cabinetEnabled, useNAMAmpEnabled, reverbReady, getPedalNode, getCabinetChain, getNAMAmpChain, namAmp.isNAMLoaded, namAmp.loadingError]);

  // effect hook: updates NAM input/output gain
  useEffect(() => {
    if (namAmp.isNAMLoaded) {
      namAmp.updateInputGain(namInputGain);
    }
  }, [namInputGain, namAmp.isNAMLoaded, namAmp]);

  useEffect(() => {
    if (namAmp.isNAMLoaded) {
      namAmp.updateOutputGain(namOutputGain);
    }
  }, [namOutputGain, namAmp.isNAMLoaded, namAmp]);

  // effect hook: updates distortion in real time whenever user adjusts it
  useEffect(() => {
    // Update native Web Audio API distortion
    if (distortionNodeRef.current && audioContextRef.current) {
      const makeDistortionCurve = (amount: number) => {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        const scaledAmount = amount * 50; // Make it aggressive
        
        for (let i = 0; i < samples; i++) {
          const x = (i * 2) / samples - 1;
          curve[i] = ((3 + scaledAmount) * x * 20 * deg) / (Math.PI + scaledAmount * Math.abs(x));
        }
        return curve;
      };
      
      distortionNodeRef.current.curve = makeDistortionCurve(distortionValue);
      console.log(`✅ NATIVE WEB AUDIO: Distortion updated to ${distortionValue} (scaled: ${distortionValue * 50})`);
    } else if (distortion.current && (distortion.current as any)._waveshaper) {
      // Fallback to Tone.js wrapper
      const waveshaper = (distortion.current as any)._waveshaper as WaveShaperNode;
      const makeCurve = (distortion.current as any)._makeCurve;
      const newCurve = makeCurve(distortionValue);
      waveshaper.curve = newCurve;
      (distortion.current as any).distortion = distortionValue;
      console.log(`Distortion updated to: ${distortionValue} (Tone.js wrapper)`);
    } else if (distortion.current) {
      (distortion.current as any).distortion = distortionValue;
      console.log(`Distortion updated to: ${distortionValue} (Tone.js API)`);
    }
  }, [distortionValue]);

  // effect hook: same deal but for the EQ
  useEffect(() => {
    if (eq.current) {
      eq.current.low.value = bassValue;
      eq.current.mid.value = midValue;
      eq.current.high.value = trebleValue;
    }
  }, [bassValue, midValue, trebleValue]);

  // effect hook: same deal but for the volume
  useEffect(() => {
    if (volume.current) {
      volume.current.volume.value = volumeValue;
    }
  }, [volumeValue]);

  // effect hook: same deal but for the reverb
  useEffect(() => {
    if (reverb.current) {
      reverb.current.wet.value = reverbValue;
      const actualWet = reverb.current.wet.value;
      const dry = 1 - actualWet;
      console.log(`Reverb wet updated to: ${reverbValue}, actual: ${actualWet} (${(actualWet * 100).toFixed(0)}% wet, ${(dry * 100).toFixed(0)}% dry)`);
      
      // Warn if reverb is too high (will mask the original signal)
      if (actualWet > 0.8) {
        console.warn(`⚠ Reverb wet is very high (${(actualWet * 100).toFixed(0)}%) - you may only hear reverb tail, not the original signal with effects!`);
      }
    }
  }, [reverbValue]);


  const togglePower = async () => {
    if (!isEngineStarted) {
      try {
        // Use native Web Audio API instead of Tone.js
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContextClass();
        audioContextRef.current = context;
        
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
        mediaStreamRef.current = stream;
        
        // Create source from media stream
        const source = context.createMediaStreamSource(stream);
        mediaStreamSourceRef.current = source;
        
        // Create distortion using WaveShaperNode
        const waveshaper = context.createWaveShaper();
        const makeDistortionCurve = (amount: number) => {
          const samples = 44100;
          const curve = new Float32Array(samples);
          const deg = Math.PI / 180;
          const scaledAmount = amount * 50; // Make it aggressive
          
          for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + scaledAmount) * x * 20 * deg) / (Math.PI + scaledAmount * Math.abs(x));
          }
          return curve;
        };
        
        waveshaper.curve = makeDistortionCurve(distortionValue);
        waveshaper.oversample = '4x';
        distortionNodeRef.current = waveshaper;
        
        // Create gain nodes
        const inputGain = context.createGain();
        inputGain.gain.value = 5.0; // 5x boost
        gainNodeRef.current = inputGain;
        
        const outputGain = context.createGain();
        outputGain.gain.value = 0.5; // Prevent clipping
        outputGainRef.current = outputGain;
        
        // Connect: source -> inputGain -> waveshaper -> outputGain -> destination
        source.connect(inputGain);
        inputGain.connect(waveshaper);
        waveshaper.connect(outputGain);
        outputGain.connect(context.destination);
        
        setIsEngineStarted(true);
        console.log("✅ NATIVE WEB AUDIO API: Audio chain connected!");
        console.log("✅ Chain: mic -> gain(5x) -> waveshaper(distortion) -> outputGain -> speakers");
        console.log(`✅ Latency: ${(context.baseLatency * 1000).toFixed(2)}ms`);
        console.log(`✅ Distortion value: ${distortionValue}, scaled: ${distortionValue * 50}`);
        
      } catch (e) {
        console.error("❌ Web Audio API error:", e);
        alert("Could not access microphone. Please check permissions.");
      }
    } else {
      // Stop audio
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsEngineStarted(false);
      console.log("Audio stopped");
    }
  };

  // Control component: Text input for numeric values
  const Control: FC<ControlProps> = ({ label, value, min, max, step, onChange, unit = '' }) => {
    const [inputValue, setInputValue] = useState<string>(value.toFixed(step < 1 ? 2 : 1));
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Update input value when prop changes
    useEffect(() => {
      setInputValue(value.toFixed(step < 1 ? 2 : 1));
    }, [value, step]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
    };

    const handleBlur = () => {
      // Validate and clamp value on blur
      let numValue = parseFloat(inputValue);
      if (isNaN(numValue)) {
        numValue = value; // Reset to current value if invalid
      }
      numValue = Math.max(min, Math.min(max, numValue));
      // Round to nearest step
      const steppedValue = Math.round((numValue - min) / step) * step + min;
      setInputValue(steppedValue.toFixed(step < 1 ? 2 : 1));
      onChange(steppedValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur(); // Trigger validation
      }
    };

    return (
      <div className="slider-container">
        <div className="slider-header">
          <div className="slider-label">{label}</div>
          <div className="slider-value">
            {value.toFixed(step < 1 ? 2 : 1)}{unit}
          </div>
        </div>
        
        <div className="control-input-wrapper" style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="number"
            min={min}
            max={max}
            step={step}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="control-input"
            style={{
              width: '100%',
              padding: '8px 12px',
              paddingRight: unit ? '40px' : '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '1em',
              textAlign: 'center',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
          {unit && (
            <span style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#ffd700',
              pointerEvents: 'none',
              fontSize: '0.9em'
            }}>
              {unit}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="demo">
      <h1>ToneJS Amp Demo</h1>
      <button 
        onClick={togglePower}
        className={`power-button ${isEngineStarted ? 'on' : 'off'}`}
      >
        {isEngineStarted ? "OFF" : "ON"}
      </button>

      {isEngineStarted && (
        <div className="amp-interface">
          <div className="control-group">
            <label className="toggle-label">
              <input 
                type="checkbox"
                checked={useDirectMode}
                onChange={(e) => setUseDirectMode(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Low Latency Mode
            </label>
          </div>
          
          {/* only show the amp controls when not in direct/low-latency mode */}
          {/* in direct mode, the signal bypasses all effects for minimal latency */}
          {!useDirectMode && (
            <>
              {/* NAM toggle - above the amp flexbox */}
              <div className="control-group" style={{ marginBottom: '20px' }}>
                <label className="toggle-label">
                  <input 
                    type="checkbox"
                    checked={useNAMAmpEnabled}
                    onChange={(e) => setUseNAMAmpEnabled(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Use NAM Amp (replaces standard amp)
                </label>
              </div>

              {/* Pedal, Amp, Cabinet side by side */}
              <div className="amp-cabinet-container">
              {/* Pedal section: comes before amp in signal chain */}
              <div className="sliders-section">
                <h2 className="section-title">Pedal</h2>
                <div className="control-group" style={{ marginBottom: '20px' }}>
                  <label className="toggle-label">
                    <input 
                      type="checkbox"
                      checked={pedalEnabled}
                      onChange={(e) => setPedalEnabled(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    Enable Pedal
                  </label>
                </div>
                {pedalEnabled && (
                  <div className="sliders-column">
                    <Control
                      label="Reverb Mix"
                      value={pedalReverbMix}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={setPedalReverbMix}
                    />
                    
                    <Control
                      label="Room Size"
                      value={pedalReverbRoomSize}
                      min={0.1}
                      max={1}
                      step={0.01}
                      onChange={setPedalReverbRoomSize}
                    />
                  </div>
                )}
              </div>
              {useNAMAmpEnabled ? (
                /* NAM Amp section - replaces regular amp when enabled */
                <div className="sliders-section">
                  <h2 className="section-title">NAM Amp</h2>
                  <div className="sliders-column">
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>NAM File:</label>
                        <input
                          type="text"
                          value={namFilePath}
                          onChange={(e) => setNamFilePath(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '5px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            color: 'white'
                          }}
                          placeholder="/path/to/model.nam"
                        />
                      </div>
                      {namAmp.isLoading && (
                        <div style={{ color: '#ffa500', fontSize: '0.85em' }}>Loading NAM model...</div>
                      )}
                      {namAmp.isNAMLoaded && (
                        <div style={{ color: '#4caf50', fontSize: '0.85em', marginBottom: '10px' }}>
                          ✓ NAM model loaded successfully
                        </div>
                      )}
                      {namAmp.namMetadata && (
                        <div style={{ fontSize: '0.8em', color: '#b0b0b0', marginTop: '8px' }}>
                          <div>Architecture: {(namAmp.namMetadata as any).architecture}</div>
                          {(namAmp.namMetadata as any).modelName && (
                            <div>Model: {(namAmp.namMetadata as any).modelName}</div>
                          )}
                          {(namAmp.namMetadata as any).inputLevelDBU !== undefined && (
                            <div>Input Level: {(namAmp.namMetadata as any).inputLevelDBU} dBu</div>
                          )}
                          {(namAmp.namMetadata as any).hasCondition && (namAmp.namMetadata as any).conditionSize > 1 && (
                            <div style={{ color: '#ffa500', marginTop: '5px' }}>
                              Note: This model has {(namAmp.namMetadata as any).conditionSize} condition inputs
                            </div>
                          )}
                        </div>
                      )}
                      {namAmp.loadingError && (
                        <div style={{ color: '#f44336', fontSize: '0.85em', marginTop: '5px' }}>
                          Error: {namAmp.loadingError}
                        </div>
                      )}
                    </div>

                    {/* NAM-specific controls */}
                    {namAmp.isNAMLoaded && (
                      <>
                        <Control
                          label="Input Gain"
                          value={namInputGain}
                          min={0.1}
                          max={2.0}
                          step={0.01}
                          onChange={(value) => {
                            setNamInputGain(value);
                            namAmp.updateInputGain(value);
                          }}
                        />
                        
                        <Control
                          label="Output Gain"
                          value={namOutputGain}
                          min={0.0}
                          max={1.0}
                          step={0.01}
                          onChange={(value) => {
                            setNamOutputGain(value);
                            namAmp.updateOutputGain(value);
                          }}
                        />
                        
                        {/* Future: Additional parameters could be added here based on namMetadata */}
                        {/* For example, if namMetadata.hasCondition, we could add condition parameter sliders */}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Regular Amp section - shown when NAM is disabled */
                <div className="sliders-section">
                  <h2 className="section-title">Amp</h2>
                <div className="sliders-column">
                  {/* gain control: controls the amount of distortion/overdrive */}
                  <Control
                    label="Gain"
                    value={distortionValue}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={setDistortionValue}
                  />

                  {/* EQ section within Amp */}
                  <div style={{ marginTop: '10px', marginBottom: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '15px', color: '#e0e0e0', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '2px' }}>EQ</div>
                    
                    {/* bass control: controls low frequencies */}
                    <Control
                      label="Bass"
                      value={bassValue}
                      min={-12}
                      max={12}
                      step={0.5}
                      onChange={setBassValue}
                      unit=" dB"
                    />
                    
                    {/* mid control: controls mid frequencies */}
                    <Control
                      label="Mid"
                      value={midValue}
                      min={-12}
                      max={12}
                      step={0.5}
                      onChange={setMidValue}
                      unit=" dB"
                    />
                    
                    {/* treble control: controls high frequencies */}
                    <Control
                      label="Treble"
                      value={trebleValue}
                      min={-12}
                      max={12}
                      step={0.5}
                      onChange={setTrebleValue}
                      unit=" dB"
                    />
                  </div>
                  
                  {/* reverb control: controls the wet/dry mix of the reverb effect */}
                  <Control
                    label="Reverb"
                    value={reverbValue}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={setReverbValue}
                  />
                  
                  {/* volume control: controls the master output level */}
                  <Control
                    label="Volume"
                    value={volumeValue}
                    min={-60}
                    max={0}
                    step={1}
                    onChange={setVolumeValue}
                    unit=" dB"
                  />
                </div>
              </div>
              )}

              {/* Cabinet section: separate entity from amp, side by side */}
              <div className="sliders-section">
                <h2 className="section-title">Cabinet</h2>
                <div className="control-group" style={{ marginBottom: '20px' }}>
                  <label className="toggle-label">
                    <input 
                      type="checkbox"
                      checked={cabinetEnabled}
                      onChange={(e) => setCabinetEnabled(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    Enable Cabinet
                  </label>
                </div>
                {cabinetEnabled && (
                  <div className="sliders-column">
                    {/* Low Cut: removes sub-bass frequencies */}
                    <Control
                      label="Low Cut"
                      value={cabinetLowCut}
                      min={20}
                      max={200}
                      step={1}
                      onChange={setCabinetLowCut}
                      unit=" Hz"
                    />
                    
                    {/* High Cut: speaker roll-off frequency */}
                    <Control
                      label="High Cut"
                      value={cabinetHighCut}
                      min={2000}
                      max={20000}
                      step={100}
                      onChange={setCabinetHighCut}
                      unit=" Hz"
                    />
                    
                    {/* Presence: mid-high frequency emphasis */}
                    <Control
                      label="Presence"
                      value={cabinetPresence}
                      min={-12}
                      max={12}
                      step={0.5}
                      onChange={setCabinetPresence}
                      unit=" dB"
                    />
                  </div>
                )}
              </div>
            </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TonejsDemo;

