import React, { useRef, useState } from 'react';
import { createDevice, ParameterNotificationSetting } from '@rnbo/js';

const GuitarRig = () => {
    const audioContextRef = useRef(null);
    const deviceRef = useRef(null);
    const sourceNodeRef = useRef(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [time, setTime] = useState(0.5);
    const [scale, setScale] = useState(0.5);
    const [color, setColor] = useState(0.5);
    const [volume, setVolume] = useState(0.5);
    const [mix, setMix] = useState(0.5);
    const [spread, setSpread] = useState(0.5);
    const [filter, setfilter] = useState(0.5);
    const [regen, setRegen] = useState(0.5);
    const [fb, setFb] = useState(0.5);


    const setupAudio = async () => {


        try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const context = new AudioContext();

                // Create a Gain node
                const gainNode = context.createGain();
                gainNode.gain.value = 1.0

                audioContextRef.current = context;

                // 1. Load Audio Sample directly
                const audioResponse = await fetch('/audio/practiceSetup.wav');
                const arrayBuffer = await audioResponse.arrayBuffer(); 
                const audioBuffer = await context.decodeAudioData(arrayBuffer);

                // Creating RNBO object

                // 1. Get the patcher
                const response = await fetch('/export/rnbo.filterdelay.json');
                const patcher = await response.json();

                // Add audio context and the patcher to create the device
                // Add a ref so you can manipulate the RNBO device later
                const device = await createDevice({
                  context: context,
                  options: {
                    parameterNotificationSetting: ParameterNotificationSetting.All
                  }, 
                  patcher: patcher})

                deviceRef.current = device


                // ---- Some ways to work without setting pre-sets-----

                // 1. Turn the Input ON (index 0)
                // const inputParam = device.parametersById.get('input');
                // if (inputParam) inputParam.value = 1;

                // 2. Turn the Mix up to 50% so we hear the delay
                // const mixParam = device.parametersById.get('mix');
                // if (mixParam) mixParam.value = 50; // Note: Your JSON says max is 100

                // 3. Turn Regen (Feedback) up so the echoes last
                // const regenParam = device.parametersById.get('regen');
                // if (regenParam) regenParam.value = 60;

                // 4. Ensure Volume is audible (it defaults to 0, which is fine, but let's be safe)
                // const volParam = device.parametersById.get('volume');
                // if (volParam) volParam.value = 50;

                // 5. Load your device and source
                // source.connect(device.node)
                // device.node.connect(gainNode)
                // gainNode.connect(context.destination);

                // source.start();
                // sourceNodeRef.current = source;
                
                // await context.resume();
                // setIsLoaded(true);

                // -------------------------------------------------

                // --------------Working with presets in RNBO----------------

                // Load a preset from the patcher presets list
                let presets = patcher.presets || [];
                device.setPreset(presets[6].preset)

                // 2. Create the Source
                const source = context.createBufferSource();
                source.buffer = audioBuffer;
                source.loop = true;

                // Connect to the sequence [audio source -> RNBO node -> Gain node -> Speakers]
                source.connect(device.node)
                device.node.connect(gainNode)
                gainNode.connect(context.destination);

                // [[DEBUGGING: see if the preset has actually loaded]]
                // console.log("--- Current RNBO State ---");
                // device.parameters.forEach(p => {
                //     console.log(`${p.id}: ${p.value}`);
                // });

                // 4. Start Playback
                source.start();
                sourceNodeRef.current = source;
                
                await context.resume();
                setIsLoaded(true);
                console.log("Direct Audio Playing (RNBO Bypassed)");

                // [[DEBUGGING: Check available parameters from your exported RNBO file]]
                console.log("Available parameters", device.parameters.map(p => p.id))
            } catch (err) {
                console.error("Direct Audio Setup Failed:", err);
            }
    };

    const handleTimeChange = (e) => {
        const val = parseFloat(e.target.value);
        setTime(val);
        if (deviceRef.current) {
            // Ensure 'gain' matches your param ID in the RNBO patch
            const param = deviceRef.current.parametersById.get('time');
            if (param) param.value = val;
              console.log(`RNBO param ${param.id} is now: ${param.value}`)
            } else {
              console.warn("Parameter 'time' not found in this device!")
            }
    };
    const handleScaleChange = (e) => {
        const val = parseFloat(e.target.value);
        setScale(val);
        if (deviceRef.current) {
            // Ensure 'gain' matches your param ID in the RNBO patch
            const param = deviceRef.current.parametersById.get('scale');
            if (param) param.value = val;
              console.log(`RNBO param ${param.id} is now: ${param.value}`)
            } else {
              console.warn("Parameter 'scale' not found in this device!")
            }
    };
    const handleColorChange = (e) => {
        const val = parseFloat(e.target.value);
        setColor(val);
        if (deviceRef.current) {
            // Ensure 'gain' matches your param ID in the RNBO patch
            const param = deviceRef.current.parametersById.get('color');
            if (param) param.value = val;
              console.log(`RNBO param ${param.id} is now: ${param.value}`)
            } else {
              console.warn("Parameter 'color' not found in this device!")
            }
    };
    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (deviceRef.current) {
            // Ensure 'gain' matches your param ID in the RNBO patch
            const param = deviceRef.current.parametersById.get('volume');
            if (param) param.value = val;
              console.log(`RNBO param ${param.id} is now: ${param.value}`)
            } else {
              console.warn("Parameter 'volume' not found in this device!")
            }
    };
    const handleMixChange = (e) => {
        const val = parseFloat(e.target.value);
        setMix(val);
        if (deviceRef.current) {
            // Ensure 'gain' matches your param ID in the RNBO patch
            const param = deviceRef.current.parametersById.get('mix');
            if (param) param.value = val;
              console.log(`RNBO param ${param.id} is now: ${param.value}`)
            } else {
              console.warn("Parameter 'mix' not found in this device!")
            }
    };
    const handleSpreadChange = (e) => {
        const val = parseFloat(e.target.value);
        setSpread(val);
        if (deviceRef.current) {
            // Ensure 'gain' matches your param ID in the RNBO patch
            const param = deviceRef.current.parametersById.get('spread');
            if (param) param.value = val;
              console.log(`RNBO param ${param.id} is now: ${param.value}`)
            } else {
              console.warn("Parameter 'spread' not found in this device!")
            }
    };
    const handleFilterChange = (e) => {
        const val = parseFloat(e.target.value);
        setfilter(val);
        if (deviceRef.current) {
            // Ensure 'gain' matches your param ID in the RNBO patch
            const param = deviceRef.current.parametersById.get('filter');
            if (param) param.value = val;
              console.log(`RNBO param ${param.id} is now: ${param.value}`)
            } else {
              console.warn("Parameter 'filter' not found in this device!")
            }
    }
    const handleRegenChange = (e) => {
        const val = parseFloat(e.target.value);
        setRegen(val);
        if (deviceRef.current) {
            // Ensure 'gain' matches your param ID in the RNBO patch
            const param = deviceRef.current.parametersById.get('regen');
            if (param) param.value = val;
              console.log(`RNBO param ${param.id} is now: ${param.value}`)
            } else {
              console.warn("Parameter 'regen' not found in this device!")
            }
    };
    const handleFBChange = (e) => {
        const val = parseFloat(e.target.value);
        setFb(val);
        if (deviceRef.current) {
            // Ensure 'gain' matches your param ID in the RNBO patch
            const param = deviceRef.current.parametersById.get('fb');
            if (param) param.value = val;
              console.log(`RNBO param ${param.id} is now: ${param.value}`)
            } else {
              console.warn("Parameter 'fb' not found in this device!")
            }
    }

    return (
        <div style={{ padding: '20px', background: '#222', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
            {!isLoaded ? (
                <button 
                    onClick={setupAudio} 
                    style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#4CAF50', border: 'none', color: 'white', borderRadius: '5px' }}
                >
                    🔌 Power On Guitar Rig
                </button>
            ) : (
                <div>
                    <h3>🎸 Blues/Jazz Amp Active</h3>
                    <div style={{ margin: '20px 0' }}>
                        <label>Time: </label>
                        <input 
                            type="range" 
                            min="0" max="100" step="0.01" 
                            value={time} 
                            onChange={handleTimeChange} 
                        />
                        <span> {Math.round(time)}%</span>
                    </div>
                    <div style={{ margin: '20px 0' }}>
                        <label>Scale: </label>
                        <input 
                            type="range" 
                            min="0" max="6" step="0.01" 
                            value={scale} 
                            onChange={handleScaleChange} 
                        />
                        <span> {Math.round(scale)}%</span>
                    </div>
                    <div style={{ margin: '20px 0' }}>
                        <label>Color: </label>
                        <input 
                            type="range" 
                            min="0" max="100" step="0.01" 
                            value={color} 
                            onChange={handleColorChange} 
                        />
                        <span> {Math.round(color)}%</span>
                    </div>
                    <div style={{ margin: '20px 0' }}>
                        <label>Volume: </label>
                        <input 
                            type="range" 
                            min="-100" max="100" step="0.01" 
                            value={volume} 
                            onChange={handleVolumeChange} 
                        />
                        <span> {Math.round(volume)}%</span>
                    </div>
                    <div style={{ margin: '20px 0' }}>
                        <label>Mix: </label>
                        <input 
                            type="range" 
                            min="0" max="100" step="0.01" 
                            value={mix} 
                            onChange={handleMixChange} 
                        />
                        <span> {Math.round(mix)}%</span>
                    </div>
                    <div style={{ margin: '20px 0' }}>
                        <label>Spread: </label>
                        <input 
                            type="range" 
                            min="-100" max="100" step="0.01" 
                            value={spread} 
                            onChange={handleSpreadChange} 
                        />
                        <span> {Math.round(spread)}%</span>
                    </div>
                    <div style={{ margin: '20px 0' }}>
                        <label>Filter: </label>
                        <input 
                            type="range" 
                            min="0" max="4" step="0.01" 
                            value={filter} 
                            onChange={handleFilterChange} 
                        />
                        <span> {Math.round(filter)}%</span>
                    </div>
                    <div style={{ margin: '20px 0' }}>
                        <label>Regen: </label>
                        <input 
                            type="range" 
                            min="0" max="100" step="0.01" 
                            value={regen} 
                            onChange={handleRegenChange} 
                        />
                        <span> {Math.round(regen)}%</span>
                    </div>
                    <div style={{ margin: '20px 0' }}>
                        <label>FB: </label>
                        <input 
                            type="range" 
                            min="0" max="1" step="0.1" 
                            value={fb} 
                            onChange={handleFBChange} 
                        />
                        <span> {Math.round(fb)}%</span>
                    </div>
                    <p style={{ color: '#888' }}>Sample is looping through RNBO math...</p>
                </div>
            )}
        </div>
    );
};

// Now App just renders the GuitarRig
function App() {
  return (
    <div className="App">
        <header className="App-header">
            <GuitarRig />
        </header>
    </div>
  );
}

export default App;
