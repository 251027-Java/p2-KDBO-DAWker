import React, { useState } from 'react'
// Type definitions are available but not used in JSX (TypeScript types)
// import { ConfigDTO } from '../dtos/types';
// import { ComponentDTO } from '../dtos/types';
// import { DawDTO } from '../dtos/types';

// This component is focused on defineing a drag-and-drop interface with multiple columns.
// ----------------PREVIOUS----------------
// Defined drag-n-drop between multiple columns.
// ----------------NEXT----------------
// Drag-n-drop will be within one row with a list of possible components to the left. 

export default function DragDrop() {


  // --- INITIALIZING STAGE OF DAW ----

  // Audio Context Reference
  // Can be seen as the "play" button. Needs to be activated for it to start
  const setupAudio = async () => {
    try{

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
    } catch (error) {
      console.error("Error initializing AudioContext or loading audio:", error);
    }
  }


  // 1. The "Library" of available effects
  const effectLibrary = [
    { id: 'Chorus', text: 'Chorus', type: 'Modulation', export_location: '/exports/Chorus/rnbo.chorus.json' },
    { id: 'filterDelay', text: 'filter delay', type: 'Delay/Reverb', export_location: '/exports/filterDelay/rnbo.filterDelay.json' },
    { id: 'overdrive', text: 'Overdrive', type: 'Dynamics', export_location: '/exports/overdrive/rnbo.overdrive.json' },
  ];

  // 2. The active signal chain (your row)
  const [pedalboard, setPedalboard] = useState([]);

  // 3. The DAW State
  //  TO-DO: Integrate with Backend DAW state
  // (should be upgraded to get the current state it will be in from the Backend)
  // Should prompt viewer if they wish to save the current state before loading a new page or new DAW
  const [dawState, setDawState] = useState({
    id: 'daw1',
    name: 'My First DAW',
    listOfConfigs: []
  });

  // --- End of DAW initialization ---

  // --- DRAG LOGIC ---
  // Parameters:
  // e - the event
  // id - the id of the dragged item
  // fromSidebar - boolean indicating if it's from the library or within the board
  function onDragStart(e, id, fromSidebar = false) {

    // We tell the drop zone if it's coming from the sidebar or just moving within the board
    const payload = JSON.stringify({ id, fromSidebar });
    e.dataTransfer.setData('text/plain', payload);
  }



  // On drop to board at specific index, update the pedalboard state
  function onDropToBoard(e, targetIdx) {
    e.preventDefault();
    const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { id, fromSidebar } = payload;

    setPedalboard((prev) => {

      // create a copy of current board
      const newBoard = [...prev];

      if (fromSidebar) {
        // --- CASE A: NEW PEDAL ---
        if (prev.length >= 5) return prev;
        const template = effectLibrary.find(item => item.id === id);
        if (!template) return prev;
        
        // Map library item to ComponentDTO structure
        const newPedal = {
          instanceId: Date.now().toString(),
          name: template.text,
          type: template.type === 'Modulation' ? 'filter' : 
                template.type === 'Delay/Reverb' ? 'delay' : 
                template.type === 'Dynamics' ? 'distortion' : 'filter',
          settings: {
            Technology: 'RNBO',
            export_name: template.export_location,
            parameters: {}
          }
        };
        
        // Insert at the exact spot
        newBoard.splice(targetIdx, 0, newPedal);
      } else {
        // --- CASE B: REORDERING ---
        // 1. Find the current position of the pedal we are moving
        const oldIdx = newBoard.findIndex(p => p.instanceId === id);
        const pedalToMove = newBoard[oldIdx];

        // 2. Remove it from the old position
        newBoard.splice(oldIdx, 1);

        // 3. Insert it at the new position
        newBoard.splice(targetIdx, 0, pedalToMove);
      }

      return newBoard.slice(0, 5); // Safety cap
    });
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  // ---- EVENT TRACKING ----
  // TODO: Audio processing will be implemented when RNBO integration is ready
  // For now, this is commented out to allow the UI to render
  /*
  const audioContextRef = useRef(null);
  const activeNodes = useRef(new Map());
  
  useEffect(() => {
    const syncAudio = async () => {
        if (!audioContextRef.current) return;
        
        // 1. DISCONNECT EVERYTHING (The Re-wire start)
        // source.disconnect();
        // activeNodes.current.forEach(device => device.node.disconnect());
        // gainNode.disconnect();

        // 2. CLEANUP: Delete devices that are no longer in the pedalboard
        const currentIds = new Set(pedalboard.map(p => p.instanceId));
        activeNodes.current.forEach((device, id) => {
            if (!currentIds.has(id)) {
                device.node.disconnect(); // Extra safety
                activeNodes.current.delete(id);
            }
        });

        // 3. RE-BUILD & SYNC
        // let currentInput = source;

        for (const pedalDTO of pedalboard) {
            // Audio processing logic will go here
            // let device = activeNodes.current.get(pedalDTO.instanceId);
            // if (!device) {
            //     device = await createRNBODevice(pedalDTO.modelId); 
            //     activeNodes.current.set(pedalDTO.instanceId, device);
            // }
        }
    };

    syncAudio();
    
  }, [pedalboard]);
  */

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#1a1a1a', color: 'white', minHeight: '100vh', width: '100%' }}>
      
      {/* SIDEBAR: The possible components */}
      <div className="sidebar" style={{ width: '200px', borderRight: '1px solid #444', paddingRight: '20px' }}>
        <h3>Pedal Library</h3>
        {effectLibrary.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => onDragStart(e, item.id, true)}
            style={{ padding: '10px', margin: '10px 0', background: '#333', cursor: 'grab', borderRadius: '4px', border: '1px solid #555' }}
          >
            {item.text}
          </div>
        ))}
      </div>

      {/* THE ROW: Where components are dropped */}
      <div style={{ flexGrow: 1 }}>
        <h3>Signal Chain (Drop Here)</h3>
        <div 
          className="pedal-row"
          onDragOver={onDragOver}
          onDrop={onDropToBoard}
          style={{ 
            display: 'flex', 
            gap: '15px', 
            minHeight: '120px', 
            background: '#222', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '2px dashed #444',
            alignItems: 'center',
          }}
        >
          {pedalboard.map((pedal, idx) => (
            <div 
              key={pedal.instanceId} 
              draggable
              onDragStart={(e) => onDragStart(e, pedal.instanceId, false)}
              onDragOver = {onDragOver}
              onDrop={(e) => onDropToBoard(e, idx)}
              style={{ 
                width: '100px', 
                height: '100px', 
                background: pedal.type === 'filter' ? '#4CAF50' : '#2196F3',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                cursor: 'grab'
              }}
            >
              {/* Set components here, make it look much better with different config sets */}
              {pedal.name}
            </div>
          ))}
          {/* Simple set that says there are some additionals that can be added */}
          {pedalboard.length < 5 && (
            <div 
              onDragOver={onDragOver}
              onDrop={(e) => onDropToBoard(e, pedalboard.length)}
              style={{ flexGrow: 1, minWidth: '50px', height: '100px', border: '1px dashed #444' }}
            >
              +
            </div>
          )}
          {pedalboard.length === 0 && <p style={{ color: '#666' }}>Drag a pedal here to start your rig...</p>}
        </div>
      </div>
    </div>
  );
}