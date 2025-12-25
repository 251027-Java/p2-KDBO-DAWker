import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

const TonejsDemo = () => {
  const [isEngineStarted, setIsEngineStarted] = useState(false);
  const [useDirectMode, setUseDirectMode] = useState(false); // this is to test low latency
  
  const mic = useRef(null);
  const distortion = useRef(null);

  useEffect(() => {
    // this is to test low latency
    Tone.Transport.lookAhead = 0.05;

    // grabs interface stream
    mic.current = new Tone.UserMedia();

    // uses wet/dry mix of 1.0 for distortion to minimize processing overhead
    distortion.current = new Tone.Distortion(0.4); 

    mic.current.chain(distortion.current, Tone.Destination);
    
    return () => {
      if (mic.current) {
        mic.current.disconnect();
        mic.current.dispose();
      }
      if (distortion.current) distortion.current.dispose();
    };
  }, []);

  // mode switching
  useEffect(() => {
    if (mic.current && isEngineStarted) {
      mic.current.disconnect();
      if (useDirectMode) {
        mic.current.connect(Tone.Destination);
      } else {
        mic.current.chain(distortion.current, Tone.Destination);
      }
    }
  }, [useDirectMode, isEngineStarted]);

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

  return (
    <div className="demo">
      <h1>ToneJS Demo</h1>
      <button 
        onClick={togglePower}
        className={`power-button ${isEngineStarted ? 'on' : 'off'}`}
      >
        {isEngineStarted ? "OFF" : "ON"}
      </button>

      {isEngineStarted && (
        <div className="controls">
          <div className="control-group">
            <label>
              <input 
                type="checkbox"
                checked={useDirectMode}
                onChange={(e) => setUseDirectMode(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              low latency
            </label>
          </div>
          
          {!useDirectMode && (
            <div className="control-group">
              <label>gain</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                defaultValue="0.4"
                onChange={(e) => {
                  if (distortion.current) {
                    distortion.current.distortion = parseFloat(e.target.value);
                  }
                }} 
              />
              <span className="value-display">
                {distortion.current?.distortion.toFixed(2) || '0.40'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TonejsDemo;
