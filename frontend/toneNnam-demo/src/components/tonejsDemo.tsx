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
  
  // Typed Audio Refs
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

    // actual distortion effect node (use current distortionValue)
    distortion.current = new Tone.Distortion(distortionValue);
    console.log(`Distortion node created with value: ${distortionValue}, actual: ${distortion.current.distortion}`);
    
    // Verify distortion is working by checking the node
    if (distortion.current) {
      // Force set it to ensure it's applied
      distortion.current.distortion = distortionValue;
      console.log(`Distortion verified: ${distortion.current.distortion}`);
    }

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
      if (distortion.current) distortion.current.dispose();
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
            distortion.current.distortion = distortionValue;
            console.log(`Connecting distortion with value: ${distortionValue} (verified: ${distortion.current.distortion})`);
            
            // Connect: currentOutput -> distortion -> EQ
            currentOutput.connect(distortion.current);
            distortion.current.connect(eq.current);
            currentOutput = eq.current;
            
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
    if (distortion.current) {
      // Set the distortion value - try both direct assignment and using the set method
      distortion.current.distortion = distortionValue;
      
      // Also try setting it via the distortion property directly
      // Some versions of Tone.js might need this
      if (typeof distortion.current.set === 'function') {
        distortion.current.set({ distortion: distortionValue });
      }
      
      // Verify it was set correctly
      const actualValue = distortion.current.distortion;
      console.log(`Distortion updated to: ${distortionValue}, actual node value: ${actualValue}`);
      
      // If values don't match, there might be an issue
      if (Math.abs(actualValue - distortionValue) > 0.01) {
        console.warn(`⚠ Distortion value mismatch! Expected: ${distortionValue}, Got: ${actualValue}`);
      }
      
      // Test if distortion is actually processing
      if (distortion.current.numberOfInputs > 0 && distortion.current.numberOfOutputs > 0) {
        console.log(`✓ Distortion node is connected (inputs: ${distortion.current.numberOfInputs}, outputs: ${distortion.current.numberOfOutputs})`);
      } else {
        console.error(`⚠ Distortion node connection issue! (inputs: ${distortion.current.numberOfInputs}, outputs: ${distortion.current.numberOfOutputs})`);
      }
    } else {
      console.warn('⚠ Distortion node not available when trying to update');
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
    if (!isEngineStarted && mic.current) {
      await Tone.start();
      
      try {
        await mic.current.open();
        setIsEngineStarted(true);
        console.log("input works");
        const context = Tone.getContext();
        const latency = (context as any).latency || 0;
        console.log(`latency: ${(latency * 1000).toFixed(2)}ms`);
      } catch (e) {
        console.error("interface access error", e);
      }
    } else if (mic.current) {
      mic.current.close();
      setIsEngineStarted(false);
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

