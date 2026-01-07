import React, { useState, useEffect, useRef } from 'react';

const GuitarAmp = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [deviceReady, setDeviceReady] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({});
  
  const audioContextRef = useRef(null);
  const rnboDeviceRef = useRef(null);
  const inputNodeRef = useRef(null);
  const streamRef = useRef(null);

  // initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // load RNBO patch
  const loadRNBOPatch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // fetch the RNBO patch export
      const response = await fetch('/patch.export.json');
      if (!response.ok) {
        throw new Error('Failed to load patch.export.json. Make sure it\'s in the public folder.');
      }
      
      const patchExport = await response.json();
      
      // import RNBO.js
      const { createDevice } = await import('@rnbo/js');
      
      const context = audioContextRef.current;
      
      // create RNBO device
      const device = await createDevice({ context, patchExport });
      
      // connect device to audio output
      device.node.connect(context.destination);
      
      rnboDeviceRef.current = device;
      
      // extract all parameters from the device
      const parameters = {};
      device.parameters.forEach(param => {
        parameters[param.name] = {
          id: param.id,
          name: param.name,
          min: param.min,
          max: param.max,
          value: param.value,
          steps: param.steps
        };
      });
      
      setParams(parameters);
      setDeviceReady(true);
      setLoading(false);
      
      console.log('RNBO device loaded successfully');
      console.log('Available parameters:', Object.keys(parameters));
      
    } catch (err) {
      setError(`Failed to load RNBO patch: ${err.message}`);
      console.error(err);
      setLoading(false);
    }
  };

  // start audio input from microphone/interface
  const startAudioInput = async () => {
    if (!audioContextRef.current || !rnboDeviceRef.current) {
      setError('RNBO device not loaded. Please load the patch first.');
      return;
    }
    
    try {
      // request audio input with optimal settings for guitar
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          latency: 0,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      
      const context = audioContextRef.current;
      
      // resume context if suspended (required by browsers)
      if (context.state === 'suspended') {
        await context.resume();
      }
      
      // create input node from audio stream
      const inputNode = context.createMediaStreamSource(stream);
      inputNodeRef.current = inputNode;
      
      // connect input to RNBO device
      inputNode.connect(rnboDeviceRef.current.node);
      
      setIsProcessing(true);
      setError(null);
      
      console.log('Audio processing started');
      
    } catch (err) {
      setError(`Failed to access audio input: ${err.message}`);
      console.error(err);
    }
  };

  // stop audio processing
  const stopAudioInput = () => {
    if (inputNodeRef.current) {
      inputNodeRef.current.disconnect();
      inputNodeRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsProcessing(false);
    console.log('Audio processing stopped');
  };

  // update a specific RNBO parameter
  const updateParameter = (paramName, value) => {
    if (rnboDeviceRef.current && params[paramName]) {
      const param = rnboDeviceRef.current.parametersById.get(params[paramName].id);
      if (param) {
        param.value = parseFloat(value);
      }
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioInput();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            RNBO Guitar Amp
          </h1>
          <p className="text-gray-400">Real-time guitar processing in your browser</p>
        </div>
        
        {/* error display */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">Warning</span>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}
        
        {/* main control panel */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8 mb-6 border border-gray-700">
          {/* load patch section */}
          {!deviceReady && (
            <div className="text-center space-y-4">
              <button
                onClick={loadRNBOPatch}
                disabled={loading}
                className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/50'
                }`}
              >
                {loading ? 'Loading Patch...' : 'Load RNBO Patch'}
              </button>
              <p className="text-gray-400 text-sm">
                Make sure <code className="bg-gray-700 px-2 py-1 rounded">patch.export.json</code> is in your public folder
              </p>
            </div>
          )}
          
          {/* audio controls */}
          {deviceReady && (
            <div className="space-y-6">
              {/* start/stop buttons */}
              <div className="flex justify-center gap-4">
                {!isProcessing ? (
                  <button
                    onClick={startAudioInput}
                    className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
                  >
                    Start Processing
                  </button>
                ) : (
                  <button
                    onClick={stopAudioInput}
                    className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
                  >
                    Stop Processing
                  </button>
                )}
              </div>
              
              {/* processing indicator */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="relative">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-green-400 font-semibold text-lg">LIVE</span>
                </div>
              )}
              
              {/* parameters grid */}
              {Object.keys(params).length > 0 && (
                <div className="space-y-6 mt-8">
                  <h2 className="text-2xl font-bold text-center mb-6">Effect Controls</h2>
                  
                  {/* organize parameters by section */}
                  <ParameterSection 
                    title="Input" 
                    params={params} 
                    paramNames={['inputGain']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="Distortion" 
                    params={params} 
                    paramNames={['drive']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="EQ" 
                    params={params} 
                    paramNames={['bass', 'mid', 'treble', 'presence']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="Cabinet" 
                    params={params} 
                    paramNames={['cabinet']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="Delay" 
                    params={params} 
                    paramNames={['delayTime', 'delayFeedback', 'delayMix']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="Reverb" 
                    params={params} 
                    paramNames={['reverbDecay', 'reverbMix']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="Output" 
                    params={params} 
                    paramNames={['master']}
                    updateParameter={updateParameter}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* instructions panel */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="font-bold text-xl mb-4 text-blue-400">Setup Instructions</h3>
          <ol className="space-y-3 text-gray-300 list-decimal list-inside">
            <li>Create your guitar amp patch in Max/MSP using RNBO</li>
            <li>Export the patch as "patch.export.json"</li>
            <li>Place the file in your React project's <code className="bg-gray-700 px-2 py-1 rounded">public/</code> folder</li>
            <li>Click "Load RNBO Patch" above</li>
            <li>When prompted, select your Focusrite interface</li>
            <li>Click "Start Processing" and play your guitar</li>
            <li>Adjust parameters in real-time to shape your tone</li>
          </ol>
          
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-300 text-sm">
              <strong>Note:</strong> Your browser will request permission to access your audio interface.
              Make sure your Focusrite is connected before clicking "Start Processing".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// helper component for parameter sections
const ParameterSection = ({ title, params, paramNames, updateParameter }) => {
  // filter to only show parameters that exist
  const existingParams = paramNames.filter(name => params[name]);
  
  if (existingParams.length === 0) return null;
  
  return (
    <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
      <h3 className="text-lg font-bold mb-4 text-blue-300">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {existingParams.map(paramName => {
          const param = params[paramName];
          return (
            <div key={paramName} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-300">
                  {param.name}
                </label>
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  {param.value.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={(param.max - param.min) / 100}
                defaultValue={param.value}
                onChange={(e) => updateParameter(paramName, e.target.value)}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{param.min}</span>
                <span>{param.max}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuitarAmp;

