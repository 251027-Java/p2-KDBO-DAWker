import React, { useState, useEffect, useRef, DragEvent } from 'react';
import { dawAPI } from '../utils/dawAPI';
import { DawDTO, ConfigDTO, ComponentDTO, SettingsDTO } from '../dtos/types';

// Declare webkitAudioContext so TypeScript doesn't complain
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Define the shape of your library items
interface LibraryItem {
  id: string;
  text: string;
  type: string;
  export_location: string;
}

// Define how we track pedalboard items (DTO + UI specific fields)
interface PedalInstance extends Partial<LibraryItem> {
  instanceId: number;
  type?: string;
  text?: string;
}

export default function DragDrop() {
  // 1. Audio References
  const audioContextRef = useRef<AudioContext | null>(null);

  // 2. State with strict types
  const [dawState, setDawState] = useState<DawDTO | null>(null);
  const [configList, setConfigList] = useState<ConfigDTO[]>([]);
  const [componentChain, setComponentChain] = useState<ComponentDTO[]>([]);
  const [pedalboard, setPedalboard] = useState<PedalInstance[]>([]);

  const effectLibrary: LibraryItem[] = [
    { id: 'Chorus', text: 'Chorus', type: 'Modulation', export_location: '/exports/Chorus/rnbo.chorus.json' },
    { id: 'filterDelay', text: 'filter delay', type: 'Delay/Reverb', export_location: '/exports/filterDelay/rnbo.filterDelay.json' },
    { id: 'overdrive', text: 'Overdrive', type: 'Dynamics', export_location: '/exports/overdrive/rnbo.overdrive.json' },
  ];

  // --- AUDIO SETUP ---
  const setupAudio = async () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();

      const gainNode = context.createGain();
      gainNode.gain.value = 1.0;

      audioContextRef.current = context;

      const audioResponse = await fetch('/audio/practiceSetup.wav');
      const arrayBuffer = await audioResponse.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      
      console.log("Audio Loaded:", audioBuffer.duration);
    } catch (error) {
      console.error("Error initializing AudioContext:", error);
    }
  };

  // --- FETCH DATA ---
  useEffect(() => {
    dawAPI.getDawById("587990d4-ede8-475a-a0a6-ee10c067f433")
      .then((daw: DawDTO) => {
        setDawState(daw);
      })
      .catch((error) => console.error(error));
  }, []);

  // --- DRAG & DROP LOGIC ---
  
  // Use React.DragEvent for HTML5 Drag and Drop
  const onDragStart = (e: DragEvent, id: string | number, fromSidebar: boolean = false) => {
    const payload = JSON.stringify({ id, fromSidebar });
    e.dataTransfer.setData('text/plain', payload);
  };

  const onDropToBoard = (e: DragEvent, targetIdx: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    const { id, fromSidebar } = JSON.parse(data);

    setPedalboard((prev) => {
      const newBoard = [...prev];

      if (fromSidebar) {
        if (prev.length >= 5) return prev;
        const template = effectLibrary.find(item => item.id === id);
        if (!template) return prev;

        const newPedal: PedalInstance = { ...template, instanceId: Date.now() };
        newBoard.splice(targetIdx, 0, newPedal);
      } else {
        const oldIdx = newBoard.findIndex(p => p.instanceId === id);
        if (oldIdx === -1) return prev;

        const [pedalToMove] = newBoard.splice(oldIdx, 1);
        newBoard.splice(targetIdx, 0, pedalToMove);
      }

      return newBoard.slice(0, 5);
    });
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault(); // Necessary to allow drop
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#1a1a1a', color: 'white', minHeight: '300px' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '200px', borderRight: '1px solid #444', paddingRight: '20px' }}>
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
        <button onClick={setupAudio} style={{ marginTop: '20px', width: '100%' }}>Start Audio</button>
      </div>

      {/* THE BOARD */}
      <div style={{ flexGrow: 1 }}>
        <h3>Signal Chain (Drop Here)</h3>
        <div 
          onDragOver={onDragOver}
          onDrop={(e) => onDropToBoard(e, pedalboard.length)}
          style={{ 
            display: 'flex', gap: '15px', minHeight: '120px', 
            background: '#222', padding: '20px', borderRadius: '8px', 
            border: '2px dashed #444', alignItems: 'center',
          }}
        >
          {pedalboard.map((pedal, idx) => (
            <div 
              key={pedal.instanceId} 
              draggable
              onDragStart={(e) => onDragStart(e, pedal.instanceId, false)}
              onDragOver={onDragOver}
              onDrop={(e) => {
                e.stopPropagation(); // Prevents the parent row from also firing a drop
                onDropToBoard(e, idx);
              }}
              style={{ 
                width: '100px', height: '100px', 
                background: pedal.type === 'Modulation' ? '#4CAF50' : '#2196F3',
                borderRadius: '8px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', textAlign: 'center', fontSize: '12px',
                fontWeight: 'bold', cursor: 'grab'
              }}
            >
              {pedal.text}
            </div>
          ))}
          
          {pedalboard.length === 0 && <p style={{ color: '#666' }}>Drag a pedal here to start your rig...</p>}
        </div>
      </div>
    </div>
  );
}