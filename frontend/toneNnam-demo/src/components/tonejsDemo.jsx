import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { useCabinet } from './useCabinet';
import { usePedal } from './usePedal';
import { useNAMAmp } from './useNAMAmp';

const TonejsDemo = () => {
  const [isEngineStarted, setIsEngineStarted] = useState(false);
  const [useDirectMode, setUseDirectMode] = useState(false); // this is to test low latency

  // all the state variables for the amp simulation controls
  const [distortionValue, setDistortionValue] = useState(0.4); // controls the gain applied to signal
  const [bassValue, setBassValue] = useState(0); // controls the bass frequency band in the EQ
  const [midValue, setMidValue] = useState(0); // controls the mid frequency band in the EQ
  const [trebleValue, setTrebleValue] = useState(0); // controls the treble frequency band in the EQ
  const [volumeValue, setVolumeValue] = useState(-6); // dB value
  const [reverbValue, setReverbValue] = useState(0.3); // controls the wet/dry mix of the reverb effect
  
  // pedal
  const [pedalEnabled, setPedalEnabled] = useState(true);
  const [pedalReverbMix, setPedalReverbMix] = useState(0.8); 
  const [pedalReverbRoomSize, setPedalReverbRoomSize] = useState(0.9);
  
  // cabinet
  const [cabinetEnabled, setCabinetEnabled] = useState(true);
  const [cabinetLowCut, setCabinetLowCut] = useState(80); // Hz - removes sub-bass
  const [cabinetHighCut, setCabinetHighCut] = useState(8000); // Hz - speaker roll-off
  const [cabinetPresence, setCabinetPresence] = useState(0); // dB - mid-high frequency emphasis
  
  // NAM amp
  const [useNAMAmpEnabled, setUseNAMAmpEnabled] = useState(false);
  // Default to the NAM file in the root of the project, or use the one in public folder
  const [namFilePath, setNamFilePath] = useState('/Vox AC15CH Crunch Normal.nam');
  const [namInputGain, setNamInputGain] = useState(1.0);
  const [namOutputGain, setNamOutputGain] = useState(0.5);
  
  // basic useRef hooks for the audio nodes
  const mic = useRef(null);
  const distortion = useRef(null);
  const eq = useRef(null); // references the EQ3 node for bass mid treble (AMP)
  const volume = useRef(null);
  const reverb = useRef(null); // spatial ambience/reverberation

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
    Tone.Transport.lookAhead = 0.05;

    // grabs interface stream
    mic.current = new Tone.UserMedia();

    // actual distortion effect node
    distortion.current = new Tone.Distortion(distortionValue);

    // eq3 so you can control the bass mid treble (values in decibels)
    eq.current = new Tone.EQ3({
      low: bassValue,
      mid: midValue,
      high: trebleValue
    });
    
    volume.current = new Tone.Volume(volumeValue);
    
    reverb.current = new Tone.Reverb({
      roomSize: 0.7,     // room size for amp-like reverb
      wet: reverbValue   // wet/dry mix controlled by user
    });

    // init signal chain
    mic.current.chain(
      distortion.current, 
      eq.current, 
      reverb.current, 
      volume.current, 
      Tone.Destination
    );
    
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
    
    mic.current.disconnect();
    distortion.current?.disconnect();
    eq.current?.disconnect();
    reverb.current?.disconnect();
    volume.current?.disconnect();
    
    const pedalNode = getPedalNode();
    if (pedalNode) {
      try {
        pedalNode.disconnect();
      } catch (e) {
        // ignore errors if already disconnected
      }
    }
    
    const cabinetChain = getCabinetChain();
    if (cabinetChain && cabinetEnabled) {
      cabinetChain.forEach(node => {
        if (node) {
          try {
            node.disconnect();
          } catch (e) {
            // ignore errors if already disconnected
          }
        }
      });
    }
    
    if (useDirectMode) {
      mic.current.connect(Tone.Destination);
    } else {
      // get pedal, cabinet, and NAM amp nodes
      const currentPedalNode = getPedalNode();
      const currentCabinetChain = getCabinetChain();
      const namAmpChain = getNAMAmpChain();
      
      // mic -> pedal -> (NAM amp OR distortion+EQ) -> cabinet -> reverb -> volume -> output
      let currentOutput = mic.current;
      
      // connect pedal 
      if (currentPedalNode && pedalEnabled) {
        currentOutput.connect(currentPedalNode);
        currentOutput = currentPedalNode;
      }
      
      // connect amp (either NAM or fallback distortion+EQ)
      if (namAmpChain && namAmpChain.length > 0 && useNAMAmpEnabled) {
        // Use NAM amp
        const namNode = namAmpChain[0];
        if (namNode && namNode.input) {
          currentOutput.connect(namNode.input);
          currentOutput = namNode.output;
        }
      } else {
        // Use fallback distortion + EQ
        currentOutput.connect(distortion.current);
        distortion.current.connect(eq.current);
        currentOutput = eq.current;
      }
      
      // connect cabinet
      if (currentCabinetChain && cabinetEnabled && currentCabinetChain[0] && currentCabinetChain[3]) {
        currentOutput.connect(currentCabinetChain[0]);
        currentOutput = currentCabinetChain[3]; // output from cabinet's presence filter
      }
      
      // connect reverb -> volume -> output
      currentOutput.connect(reverb.current);
      reverb.current.connect(volume.current);
      volume.current.connect(Tone.Destination);
      
      console.log("Chain connected:", {
        pedal: pedalEnabled && currentPedalNode ? 'enabled' : 'disabled',
        amp: useNAMAmpEnabled && namAmpChain ? 'NAM' : 'fallback',
        cabinet: cabinetEnabled && currentCabinetChain ? 'enabled' : 'disabled',
        namLoaded: namAmp.isNAMLoaded,
        namError: namAmp.loadingError
      });
    }
  }, [useDirectMode, isEngineStarted, pedalEnabled, cabinetEnabled, useNAMAmpEnabled, getPedalNode, getCabinetChain, getNAMAmpChain, namAmp.isNAMLoaded, namAmp.loadingError]);

  // effect hook: updates NAM input/output gain
  useEffect(() => {
    if (namAmp.isNAMLoaded) {
      namAmp.updateInputGain(namInputGain);
    }
  }, [namInputGain, namAmp.isNAMLoaded]);

  useEffect(() => {
    if (namAmp.isNAMLoaded) {
      namAmp.updateOutputGain(namOutputGain);
    }
  }, [namOutputGain, namAmp.isNAMLoaded]);

  // effect hook: updates distortion in real time whenever user adjusts it
  useEffect(() => {
    if (distortion.current) {
      distortion.current.distortion = distortionValue;
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
    }
  }, [reverbValue]);


  const togglePower = async () => {
    if (!isEngineStarted) {
      await Tone.start();
      
      try {
        await mic.current.open();
        setIsEngineStarted(true);
        console.log("input works");
        console.log(`latency: ${(Tone.context.latency * 1000).toFixed(2)}ms`);
      } catch (e) {
        console.error("interface access error", e);
      }
    } else {
      mic.current.close();
      setIsEngineStarted(false);
    }
  };

  // Control component: Text input for numeric values
  const Control = ({ label, value, min, max, step, onChange, unit = '' }) => {
    const [inputValue, setInputValue] = useState(value.toFixed(step < 1 ? 2 : 1));
    const inputRef = useRef(null);

    // Update input value when prop changes
    useEffect(() => {
      setInputValue(value.toFixed(step < 1 ? 2 : 1));
    }, [value, step]);

    const handleChange = (e) => {
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

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.target.blur(); // Trigger validation
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
        
        <div className="control-input-wrapper" style={{ position: 'relative', width: '100%' }}>
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
                          <div>Architecture: {namAmp.namMetadata.architecture}</div>
                          {namAmp.namMetadata.modelName && (
                            <div>Model: {namAmp.namMetadata.modelName}</div>
                          )}
                          {namAmp.namMetadata.inputLevelDBU !== undefined && (
                            <div>Input Level: {namAmp.namMetadata.inputLevelDBU} dBu</div>
                          )}
                          {namAmp.namMetadata.hasCondition && namAmp.namMetadata.conditionSize > 1 && (
                            <div style={{ color: '#ffa500', marginTop: '5px' }}>
                              Note: This model has {namAmp.namMetadata.conditionSize} condition inputs
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

