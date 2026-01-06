import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

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
  
  // basic useRef hooks for the audio nodes
  const mic = useRef(null);
  const distortion = useRef(null);
  const eq = useRef(null); // references the EQ3 node for bass mid treble
  const volume = useRef(null);
  const reverb = useRef(null); // spatial ambience/reverberation

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

    // audio processing chain
    // signal flow should be mic input -> distortion -> EQ -> reverb -> volume -> output destination
    // this should be pretty accurate to a real amp, but i may change it later on depending on how we feel
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

  // mode switching
  useEffect(() => {
    if (mic.current && isEngineStarted) {
      mic.current.disconnect();
      if (useDirectMode) {
        mic.current.connect(Tone.Destination);
      } else {
        mic.current.chain(
          distortion.current, 
          eq.current, 
          reverb.current, 
          volume.current, 
          Tone.Destination
        );
      }
    }
  }, [useDirectMode, isEngineStarted]);

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

  // for now im gonna use sliders for the amp simulation controls, WE SHOULD SWITCH TO KNOBS LATER ON but idk how to make knobs properly
  const Slider = ({ label, value, min, max, step, onChange, unit = '' }) => {
    return (
      <div className="slider-container">
        <div className="slider-header">
          <div className="slider-label">{label}</div> // label for the slider (like bass treble etc)
          <div className="slider-value"> // value display based on dB
            {value.toFixed(1)}{unit}  // format to 1 decimal place and append unit if provided
          </div>
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-input"
        />
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
          
          // only show the amp controls when not in direct/low-latency mode
          // in direct mode, the signal bypasses all effects for minimal latency
          {!useDirectMode && (
            <>
              <div className="sliders-section">
                <h2 className="section-title">EQ</h2>
                <div className="sliders-column">

                  // bass slider: controls low frequencies
                  <Slider
                    label="Bass"
                    value={bassValue}
                    min={-12}
                    max={12}
                    step={0.5}       // step size: 0.5 dB increments for precise control
                    onChange={setBassValue}  // updates bassValue state when slider is adjusted
                    unit=" dB"
                  />
                  
                  // mid slider: controls mid frequencies
                  <Slider
                    label="Mid"
                    value={midValue}
                    min={-12}
                    max={12}
                    step={0.5}
                    onChange={setMidValue}
                    unit=" dB"
                  />
                  
                  // treble slider: controls high frequencies
                  <Slider
                    label="Treble"
                    value={trebleValue}
                    min={-12}
                    max={12}
                    step={0.5}
                    onChange={setTrebleValue}
                    unit=" dB"
                  />
                </div>
              </div>

              // effects section: contains gain, reverb, and volume controls
              <div className="sliders-section">
                <h2 className="section-title">Effects</h2>
                <div className="sliders-column">

                  // gain slider: controls the amount of distortion/overdrive
                  <Slider
                    label="Gain"
                    value={distortionValue}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={setDistortionValue}
                  />
                  
                  // reverb slider: controls the wet/dry mix of the reverb effect
                  <Slider
                    label="Reverb"
                    value={reverbValue}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={setReverbValue}
                  />
                  
                  // volume slider: controls the master output level
                  <Slider
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TonejsDemo;
