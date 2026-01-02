// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import * as Tone from 'tone';
// import { useCabinet } from './useCabinet';
// import { usePedal } from './usePedal';
// import { buildDawDTOFromPreset, applyPresetFromComponentDTOs } from '../utils/dawUtils';
// import { getDawById, getAllDaws, saveDaw } from '../utils/dawAPI';

// const TonejsDemo = () => {
//   const [isEngineStarted, setIsEngineStarted] = useState(false);
//   const [useDirectMode, setUseDirectMode] = useState(false); // this is to test low latency

//   // all the state variables for the amp simulation controls
//   const [distortionValue, setDistortionValue] = useState(0.4); // controls the gain applied to signal
//   const [bassValue, setBassValue] = useState(0); // controls the bass frequency band in the EQ
//   const [midValue, setMidValue] = useState(0); // controls the mid frequency band in the EQ
//   const [trebleValue, setTrebleValue] = useState(0); // controls the treble frequency band in the EQ
//   const [volumeValue, setVolumeValue] = useState(-6); // dB value
//   const [reverbValue, setReverbValue] = useState(0.3); // controls the wet/dry mix of the reverb effect
  
//   // pedal
//   const [pedalEnabled, setPedalEnabled] = useState(true);
//   const [pedalReverbMix, setPedalReverbMix] = useState(0.8); 
//   const [pedalReverbRoomSize, setPedalReverbRoomSize] = useState(0.9);
  
//   // cabinet
//   const [cabinetEnabled, setCabinetEnabled] = useState(true);
//   const [cabinetLowCut, setCabinetLowCut] = useState(80); // Hz - removes sub-bass
//   const [cabinetHighCut, setCabinetHighCut] = useState(8000); // Hz - speaker roll-off
//   const [cabinetPresence, setCabinetPresence] = useState(0); // dB - mid-high frequency emphasis
  
//   // DAW/Preset management state
//   const [dawName, setDawName] = useState('');
//   const [configName, setConfigName] = useState('');
//   const [userId, setUserId] = useState(1); // TODO: Get from auth context
//   const [savedDaws, setSavedDaws] = useState([]);
//   const [showPresetDialog, setShowPresetDialog] = useState(false);
//   const [presetAction, setPresetAction] = useState(null);
  
//   // basic useRef hooks for the audio nodes
//   const mic = useRef(null);
//   const distortion = useRef(null);
//   const eq = useRef(null); // references the EQ3 node for bass mid treble (AMP)
//   const volume = useRef(null);
//   const reverb = useRef(null); // spatial ambience/reverberation

//   // pedal hook - comes before amp in signal chain
//   const pedal = usePedal(pedalEnabled, pedalReverbMix, pedalReverbRoomSize);
//   const getPedalNode = pedal.getPedalNode;

//   // Cabinet hook - separate entity from amp
//   const cabinet = useCabinet(cabinetEnabled, cabinetLowCut, cabinetHighCut, cabinetPresence);
//   const getCabinetChain = cabinet.getChain;

//   useEffect(() => {
//     // this is to test low latency
//     Tone.Transport.lookAhead = 0.05;

//     // grabs interface stream
//     mic.current = new Tone.UserMedia();

//     // actual distortion effect node
//     distortion.current = new Tone.Distortion(distortionValue);

//     // eq3 so you can control the bass mid treble (values in decibels)
//     eq.current = new Tone.EQ3({
//       low: bassValue,
//       mid: midValue,
//       high: trebleValue
//     });
    
//     volume.current = new Tone.Volume(volumeValue);
    
//     reverb.current = new Tone.Reverb({
//       roomSize: 0.7,     // room size for amp-like reverb
//       wet: reverbValue   // wet/dry mix controlled by user
//     });

//     // init signal chain
//     mic.current.chain(
//       distortion.current, 
//       eq.current, 
//       reverb.current, 
//       volume.current, 
//       Tone.Destination
//     );
    
//     // cleanup function
//     // just properly discs and disposes of nodes to prevent memory leaks
//     return () => {
//       if (mic.current) {
//         mic.current.disconnect();  // disconnect from audio graph
//         mic.current.dispose();      // release microphone resources
//       }
//       if (distortion.current) distortion.current.dispose();
//       if (eq.current) eq.current.dispose();
//       if (volume.current) volume.current.dispose();
//       if (reverb.current) reverb.current.dispose();
//     };
//   }, []);

//   // mode switching and chain rebuilding
//   useEffect(() => {
//     if (!mic.current || !isEngineStarted) return;
    
//     mic.current.disconnect();
//     distortion.current?.disconnect();
//     eq.current?.disconnect();
//     reverb.current?.disconnect();
//     volume.current?.disconnect();
    
//     const pedalNode = getPedalNode();
//     if (pedalNode) {
//       try {
//         pedalNode.disconnect();
//       } catch (e) {
//         // ignore errors if already disconnected
//       }
//     }
    
//     const cabinetChain = getCabinetChain();
//     if (cabinetChain && cabinetEnabled) {
//       cabinetChain.forEach(node => {
//         if (node) {
//           try {
//             node.disconnect();
//           } catch (e) {
//             // ignore errors if already disconnected
//           }
//         }
//       });
//     }
    
//     if (useDirectMode) {
//       mic.current.connect(Tone.Destination);
//     } else {
//       // get pedal and cabinet nodes
//       const currentPedalNode = getPedalNode();
//       const currentCabinetChain = getCabinetChain();
      
//       // mic -> pedal -> distortion -> amp EQ -> cabinet -> reverb -> volume -> output
//       let currentOutput = mic.current;
      
//       // connect pedal 
//       if (currentPedalNode && pedalEnabled) {
//         currentOutput.connect(currentPedalNode);
//         currentOutput = currentPedalNode;
//       }
      
//       // connect amp
//       currentOutput.connect(distortion.current);
//       distortion.current.connect(eq.current);
//       currentOutput = eq.current;
      
//       // connect cabinet
//       if (currentCabinetChain && cabinetEnabled && currentCabinetChain[0] && currentCabinetChain[3]) {
//         currentOutput.connect(currentCabinetChain[0]);
//         currentOutput = currentCabinetChain[3]; // output from cabinet's presence filter
//       }
      
//       // connect reverb -> volume -> output
//       currentOutput.connect(reverb.current);
//       reverb.current.connect(volume.current);
//       volume.current.connect(Tone.Destination);
      
//       console.log("Chain connected:", {
//         pedal: pedalEnabled && currentPedalNode ? 'enabled' : 'disabled',
//         cabinet: cabinetEnabled && currentCabinetChain ? 'enabled' : 'disabled'
//       });
//     }
//   }, [useDirectMode, isEngineStarted, pedalEnabled, cabinetEnabled, getPedalNode, getCabinetChain]);

//   // effect hook: updates distortion in real time whenever user adjusts it
//   useEffect(() => {
//     if (distortion.current) {
//       distortion.current.distortion = distortionValue;
//     }
//   }, [distortionValue]);

//   // effect hook: same deal but for the EQ
//   useEffect(() => {
//     if (eq.current) {
//       eq.current.low.value = bassValue;
//       eq.current.mid.value = midValue;
//       eq.current.high.value = trebleValue;
//     }
//   }, [bassValue, midValue, trebleValue]);

//   // effect hook: same deal but for the volume
//   useEffect(() => {
//     if (volume.current) {
//       volume.current.volume.value = volumeValue;
//     }
//   }, [volumeValue]);

//   // effect hook: same deal but for the reverb
//   useEffect(() => {
//     if (reverb.current) {
//       reverb.current.wet.value = reverbValue;
//     }
//   }, [reverbValue]);


//   const togglePower = async () => {
//     if (!isEngineStarted) {
//       await Tone.start();
      
//       try {
//         await mic.current.open();
//         setIsEngineStarted(true);
//         console.log("input works");
//         console.log(`latency: ${(Tone.context.latency * 1000).toFixed(2)}ms`);
//       } catch (e) {
//         console.error("interface access error", e);
//       }
//     } else {
//       mic.current.close();
//       setIsEngineStarted(false);
//     }
//   };

<<<<<<< HEAD
  // load saved DAWs on mount
  useEffect(() => {
    const loadDaws = async () => {
      try {
        const daws = await getAllDaws();
        setSavedDaws(daws);
      } catch (error) {
        console.error('Error loading DAWs:', error);
      }
    };
    loadDaws();
  }, []);

  // saves current pedal/amp/cabinet settings as a DAW configuration
  const handleSavePreset = async () => {
    if (!dawName.trim() || !configName.trim()) {
      alert('Please enter both DAW name and Config name');
      return;
    }
=======
//   // Load saved DAWs on mount
//   useEffect(() => {
//     const loadDaws = async () => {
//       try {
//         const daws = await getAllDaws();
//         setSavedDaws(daws);
//       } catch (error) {
//         console.error('Error loading DAWs:', error);
//         // Don't show error if backend isn't ready yet
//       }
//     };
//     loadDaws();
//   }, []);

//   // Save DAW handler - saves current pedal/amp/cabinet settings as a DAW configuration
//   const handleSavePreset = async () => {
//     if (!dawName.trim() || !configName.trim()) {
//       alert('Please enter both DAW name and Config name');
//       return;
//     }
>>>>>>> main

//     try {
//       const dawDTO = buildDawDTOFromPreset(
//         dawName,
//         userId,
//         configName,
//         {
//           enabled: pedalEnabled,
//           reverbMix: pedalReverbMix,
//           reverbRoomSize: pedalReverbRoomSize,
//         },
//         {
//           distortionValue,
//           bassValue,
//           midValue,
//           trebleValue,
//           reverbValue,
//           volumeValue,
//         },
//         {
//           enabled: cabinetEnabled,
//           cabinetLowCut,
//           cabinetHighCut,
//           cabinetPresence,
//         }
//       );

//       const saved = await saveDaw(dawDTO);
//       setSavedDaws([...savedDaws, saved]);
//       setDawName('');
//       setConfigName('');
//       setShowPresetDialog(false);
//       alert('DAW configuration saved successfully!');
//     } catch (error) {
//       console.error('Error saving DAW:', error);
//       alert('Failed to save DAW. Make sure the backend POST endpoint is implemented.');
//     }
//   };

<<<<<<< HEAD
  // loads a DAW and applies the first config's component chain
  const handleLoadPreset = async (dawId) => {
    try {
      const daw = await getDawById(dawId);
=======
//   // Load DAW handler - loads a DAW and applies the first config's component chain
//   const handleLoadPreset = async (dawId) => {
//     try {
//       const daw = await getDawById(dawId);
>>>>>>> main
      
//       if (!daw.listOfConfigs || daw.listOfConfigs.length === 0) {
//         alert('This DAW has no configurations');
//         return;
//       }

<<<<<<< HEAD
      // use the first config's component chain
      const firstConfig = daw.listOfConfigs[0];
      if (!firstConfig.componentChain || firstConfig.componentChain.length === 0) {
        alert('This configuration has no components');
        return;
      }
=======
//       // Use the first config's component chain
//       const firstConfig = daw.listOfConfigs[0];
//       if (!firstConfig.componentChain || firstConfig.componentChain.length === 0) {
//         alert('This configuration has no components');
//         return;
//       }
>>>>>>> main

//       const success = applyPresetFromComponentDTOs(firstConfig.componentChain, {
//         setPedalEnabled,
//         setPedalReverbMix,
//         setPedalReverbRoomSize,
//         setDistortionValue,
//         setBassValue,
//         setMidValue,
//         setTrebleValue,
//         setReverbValue,
//         setVolumeValue,
//         setCabinetEnabled,
//         setCabinetLowCut,
//         setCabinetHighCut,
//         setCabinetPresence,
//       });

//       if (success) {
//         setShowPresetDialog(false);
//         alert('DAW configuration loaded successfully!');
//       } else {
//         alert('Failed to extract settings from DAW configuration');
//       }
//     } catch (error) {
//       console.error('Error loading DAW:', error);
//       alert('Failed to load DAW. Please try again.');
//     }
//   };

//   // for now im gonna use sliders for the amp simulation controls, WE SHOULD SWITCH TO KNOBS LATER ON but idk how to make knobs properly
//   const Slider = ({ label, value, min, max, step, onChange, unit = '' }) => {
//     return (
//       <div className="slider-container">
//         <div className="slider-header">
//           <div className="slider-label">{label}</div> {/* label for the slider (like bass treble etc) */}
//           <div className="slider-value"> {/* value display based on dB */}
//             {value.toFixed(1)}{unit}  {/* format to 1 decimal place and append unit if provided */}
//           </div>
//         </div>
        
//         <input
//           type="range"
//           min={min}
//           max={max}
//           step={step}
//           value={value}
//           onChange={(e) => onChange(parseFloat(e.target.value))}
//           className="slider-input"
//         />
//       </div>
//     );
//   };

//   return (
//     <div className="demo">
//       <h1>ToneJS Amp Demo</h1>
//       <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
//         <button 
//           onClick={togglePower}
//           className={`power-button ${isEngineStarted ? 'on' : 'off'}`}
//         >
//           {isEngineStarted ? "OFF" : "ON"}
//         </button>
//         <button
//           onClick={() => {
//             setPresetAction('save');
//             setShowPresetDialog(true);
//           }}
//           style={{
//             padding: '15px 30px',
//             fontSize: '1em',
//             fontWeight: 'bold',
//             border: 'none',
//             borderRadius: '8px',
//             cursor: 'pointer',
//             background: 'linear-gradient(145deg, #4CAF50, #45a049)',
//             color: '#fff',
//             transition: 'all 0.3s ease',
//           }}
//         >
//           Save Preset
//         </button>
//         <button
//           onClick={() => {
//             setPresetAction('load');
//             setShowPresetDialog(true);
//           }}
//           style={{
//             padding: '15px 30px',
//             fontSize: '1em',
//             fontWeight: 'bold',
//             border: 'none',
//             borderRadius: '8px',
//             cursor: 'pointer',
//             background: 'linear-gradient(145deg, #2196F3, #1976D2)',
//             color: '#fff',
//             transition: 'all 0.3s ease',
//           }}
//         >
//           Load Preset
//         </button>
//       </div>

//       {/* Preset Dialog */}
//       {showPresetDialog && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           background: 'rgba(0, 0, 0, 0.7)',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           zIndex: 1000,
//         }}>
//           <div style={{
//             background: '#2a2a2a',
//             padding: '30px',
//             borderRadius: '15px',
//             minWidth: '400px',
//             maxWidth: '600px',
//             color: '#e0e0e0',
//           }}>
//             <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
//               {presetAction === 'save' ? 'Save DAW Configuration' : 'Load DAW Configuration'}
//             </h2>
            
//             {presetAction === 'save' ? (
//               <>
//                 <input
//                   type="text"
//                   placeholder="Enter DAW name"
//                   value={dawName}
//                   onChange={(e) => setDawName(e.target.value)}
//                   style={{
//                     width: '100%',
//                     padding: '10px',
//                     marginBottom: '15px',
//                     borderRadius: '5px',
//                     border: '1px solid #555',
//                     background: '#1a1a1a',
//                     color: '#e0e0e0',
//                     fontSize: '1em',
//                   }}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Enter Config name"
//                   value={configName}
//                   onChange={(e) => setConfigName(e.target.value)}
//                   style={{
//                     width: '100%',
//                     padding: '10px',
//                     marginBottom: '20px',
//                     borderRadius: '5px',
//                     border: '1px solid #555',
//                     background: '#1a1a1a',
//                     color: '#e0e0e0',
//                     fontSize: '1em',
//                   }}
//                 />
//                 <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
//                   <button
//                     onClick={() => {
//                       setShowPresetDialog(false);
//                       setDawName('');
//                       setConfigName('');
//                     }}
//                     style={{
//                       padding: '10px 20px',
//                       borderRadius: '5px',
//                       border: 'none',
//                       background: '#555',
//                       color: '#fff',
//                       cursor: 'pointer',
//                     }}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSavePreset}
//                     style={{
//                       padding: '10px 20px',
//                       borderRadius: '5px',
//                       border: 'none',
//                       background: '#4CAF50',
//                       color: '#fff',
//                       cursor: 'pointer',
//                     }}
//                   >
//                     Save
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 {savedDaws.length === 0 ? (
//                   <p>No saved DAWs found.</p>
//                 ) : (
//                   <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                     {savedDaws.map((daw) => (
//                       <div
//                         key={daw.dawId}
//                         onClick={() => handleLoadPreset(daw.dawId)}
//                         style={{
//                           padding: '15px',
//                           marginBottom: '10px',
//                           background: '#1a1a1a',
//                           borderRadius: '8px',
//                           cursor: 'pointer',
//                           border: '1px solid #555',
//                           transition: 'all 0.2s ease',
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.background = '#333';
//                           e.currentTarget.style.borderColor = '#4CAF50';
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.background = '#1a1a1a';
//                           e.currentTarget.style.borderColor = '#555';
//                         }}
//                       >
//                         <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
//                           {daw.name}
//                         </div>
//                         <div style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '5px' }}>
//                           ID: {daw.dawId}
//                         </div>
//                         <div style={{ fontSize: '0.85em', color: '#888' }}>
//                           Configs: {daw.listOfConfigs?.length || 0}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
//                   <button
//                     onClick={() => setShowPresetDialog(false)}
//                     style={{
//                       padding: '10px 20px',
//                       borderRadius: '5px',
//                       border: 'none',
//                       background: '#555',
//                       color: '#fff',
//                       cursor: 'pointer',
//                     }}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {isEngineStarted && (
//         <div className="amp-interface">
//           <div className="control-group">
//             <label className="toggle-label">
//               <input 
//                 type="checkbox"
//                 checked={useDirectMode}
//                 onChange={(e) => setUseDirectMode(e.target.checked)}
//                 style={{ marginRight: '8px' }}
//               />
//               Low Latency Mode
//             </label>
//           </div>
          
//           {/* only show the amp controls when not in direct/low-latency mode */}
//           {/* in direct mode, the signal bypasses all effects for minimal latency */}
//           {!useDirectMode && (
//             <>
//               {/* pedal section: comes before amp in signal chain */}
//               <div className="sliders-section">
//                 <h2 className="section-title">Pedal</h2>
//                 <div className="control-group" style={{ marginBottom: '20px' }}>
//                   <label className="toggle-label">
//                     <input 
//                       type="checkbox"
//                       checked={pedalEnabled}
//                       onChange={(e) => setPedalEnabled(e.target.checked)}
//                       style={{ marginRight: '8px' }}
//                     />
//                     Enable Pedal
//                   </label>
//                 </div>
//                 {pedalEnabled && (
//                   <div className="sliders-column">
//                     <Slider
//                       label="Reverb Mix"
//                       value={pedalReverbMix}
//                       min={0}
//                       max={1}
//                       step={0.01}
//                       onChange={setPedalReverbMix}
//                     />
                    
//                     <Slider
//                       label="Room Size"
//                       value={pedalReverbRoomSize}
//                       min={0.1}
//                       max={1}
//                       step={0.01}
//                       onChange={setPedalReverbRoomSize}
//                     />
//                   </div>
//                 )}
//               </div>

//               <div className="amp-cabinet-container">
//               {/* Amp section: contains EQ, gain, reverb, and volume controls */}
//               <div className="sliders-section">
//                 <h2 className="section-title">Amp</h2>
//                 <div className="sliders-column">
//                   {/* gain slider: controls the amount of distortion/overdrive */}
//                   <Slider
//                     label="Gain"
//                     value={distortionValue}
//                     min={0}
//                     max={1}
//                     step={0.01}
//                     onChange={setDistortionValue}
//                   />

//                   {/* EQ section within Amp */}
//                   <div style={{ marginTop: '10px', marginBottom: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
//                     <div style={{ textAlign: 'center', marginBottom: '15px', color: '#e0e0e0', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '2px' }}>EQ</div>
                    
//                     {/* bass slider: controls low frequencies */}
//                     <Slider
//                       label="Bass"
//                       value={bassValue}
//                       min={-12}
//                       max={12}
//                       step={0.5}
//                       onChange={setBassValue}
//                       unit=" dB"
//                     />
                    
//                     {/* mid slider: controls mid frequencies */}
//                     <Slider
//                       label="Mid"
//                       value={midValue}
//                       min={-12}
//                       max={12}
//                       step={0.5}
//                       onChange={setMidValue}
//                       unit=" dB"
//                     />
                    
//                     {/* treble slider: controls high frequencies */}
//                     <Slider
//                       label="Treble"
//                       value={trebleValue}
//                       min={-12}
//                       max={12}
//                       step={0.5}
//                       onChange={setTrebleValue}
//                       unit=" dB"
//                     />
//                   </div>
                  
//                   {/* reverb slider: controls the wet/dry mix of the reverb effect */}
//                   <Slider
//                     label="Reverb"
//                     value={reverbValue}
//                     min={0}
//                     max={1}
//                     step={0.01}
//                     onChange={setReverbValue}
//                   />
                  
//                   {/* volume slider: controls the master output level */}
//                   <Slider
//                     label="Volume"
//                     value={volumeValue}
//                     min={-60}
//                     max={0}
//                     step={1}
//                     onChange={setVolumeValue}
//                     unit=" dB"
//                   />
//                 </div>
//               </div>

//               {/* Cabinet section: separate entity from amp, side by side */}
//               <div className="sliders-section">
//                 <h2 className="section-title">Cabinet</h2>
//                 <div className="control-group" style={{ marginBottom: '20px' }}>
//                   <label className="toggle-label">
//                     <input 
//                       type="checkbox"
//                       checked={cabinetEnabled}
//                       onChange={(e) => setCabinetEnabled(e.target.checked)}
//                       style={{ marginRight: '8px' }}
//                     />
//                     Enable Cabinet
//                   </label>
//                 </div>
//                 {cabinetEnabled && (
//                   <div className="sliders-column">
//                     {/* Low Cut: removes sub-bass frequencies */}
//                     <Slider
//                       label="Low Cut"
//                       value={cabinetLowCut}
//                       min={20}
//                       max={200}
//                       step={1}
//                       onChange={setCabinetLowCut}
//                       unit=" Hz"
//                     />
                    
//                     {/* High Cut: speaker roll-off frequency */}
//                     <Slider
//                       label="High Cut"
//                       value={cabinetHighCut}
//                       min={2000}
//                       max={20000}
//                       step={100}
//                       onChange={setCabinetHighCut}
//                       unit=" Hz"
//                     />
                    
//                     {/* Presence: mid-high frequency emphasis */}
//                     <Slider
//                       label="Presence"
//                       value={cabinetPresence}
//                       min={-12}
//                       max={12}
//                       step={0.5}
//                       onChange={setCabinetPresence}
//                       unit=" dB"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TonejsDemo;

