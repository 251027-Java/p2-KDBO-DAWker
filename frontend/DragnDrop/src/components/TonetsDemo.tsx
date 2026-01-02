import React, { useState, useEffect, useRef, FC } from 'react';
import * as Tone from 'tone';
import { useCabinet } from './useCabinet';
import { usePedal } from './usePedal';
import { dawAPI } from '../utils/dawAPI';
import { buildDawDTOFromPreset, applyPresetFromComponentDTOs } from '../utils/dawUtils';
import { DawDTO } from '../dtos/types';

// Standard Web Audio Type reinforcement
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Define props for the internal Slider component
interface SliderProps {
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
  const [useDirectMode, setUseDirectMode] = useState<boolean>(false);

  // Amp Simulation State
  const [distortionValue, setDistortionValue] = useState<number>(0.4);
  const [bassValue, setBassValue] = useState<number>(0);
  const [midValue, setMidValue] = useState<number>(0);
  const [trebleValue, setTrebleValue] = useState<number>(0);
  const [volumeValue, setVolumeValue] = useState<number>(-6);
  const [reverbValue, setReverbValue] = useState<number>(0.3);
  
  // Pedal State
  const [pedalEnabled, setPedalEnabled] = useState<boolean>(true);
  const [pedalReverbMix, setPedalReverbMix] = useState<number>(0.8); 
  const [pedalReverbRoomSize, setPedalReverbRoomSize] = useState<number>(0.9);
  
  // Cabinet State
  const [cabinetEnabled, setCabinetEnabled] = useState<boolean>(true);
  const [cabinetLowCut, setCabinetLowCut] = useState<number>(80);
  const [cabinetHighCut, setCabinetHighCut] = useState<number>(8000);
  const [cabinetPresence, setCabinetPresence] = useState<number>(0);
  
  // DAW/Preset Management State
  const [dawName, setDawName] = useState<string>('');
  const [configName, setConfigName] = useState<string>('');
  const [userId] = useState<number>(1); 
  const [savedDaws, setSavedDaws] = useState<DawDTO[]>([]);
  const [showPresetDialog, setShowPresetDialog] = useState<boolean>(false);
  const [presetAction, setPresetAction] = useState<'save' | 'load' | null>(null);
  
  // Typed Audio Refs
  const mic = useRef<Tone.UserMedia | null>(null);
  const distortion = useRef<Tone.Distortion | null>(null);
  const eq = useRef<Tone.EQ3 | null>(null); 
  const volume = useRef<Tone.Volume | null>(null);
  const reverb = useRef<Tone.Reverb | null>(null);

  // Pedal & Cabinet hooks (Assuming these return Tone.js nodes/arrays)
  const pedal = usePedal(pedalEnabled, pedalReverbMix, pedalReverbRoomSize);
  const getPedalNode = pedal.getPedalNode;

  const cabinet = useCabinet(cabinetEnabled, cabinetLowCut, cabinetHighCut, cabinetPresence);
  const getCabinetChain = cabinet.getChain;

  // Initialize Audio Nodes
  useEffect(() => {
    Tone.getContext().lookAhead = 0.05;

    mic.current = new Tone.UserMedia();
    distortion.current = new Tone.Distortion(distortionValue);
    eq.current = new Tone.EQ3({ low: bassValue, mid: midValue, high: trebleValue });
    volume.current = new Tone.Volume(volumeValue);
    
    reverb.current = new Tone.Reverb(9.0);

    // Initial Reverb Setup
    // Added. Reverb needs to be generated before use. If not, it will not work properly...at least that's what I'm seeing.
    const rev = new Tone.Reverb({
        decay: 1.5,
        preDelay: 0.01,
        wet: reverbValue
    }).toDestination(); 

    // Tone.js Reverbs need to "warm up"
    reverb.current.generate().then(() => {
        reverb.current = rev;
    });

    // Initial silent chain
    mic.current.chain(
      distortion.current, 
      eq.current, 
      reverb.current, 
      volume.current, 
      Tone.Destination
    );
    
    return () => {
      mic.current?.disconnect().dispose();
      distortion.current?.dispose();
      eq.current?.dispose();
      volume.current?.dispose();
      reverb.current?.dispose();
    };
  }, []);

  // Rebuild signal chain when modes change
  useEffect(() => {
    if (!mic.current || !isEngineStarted) return;
    
    // Safety disconnect
    mic.current.disconnect();
    distortion.current?.disconnect();
    eq.current?.disconnect();
    reverb.current?.disconnect();
    volume.current?.disconnect();
    
    const pedalNode = getPedalNode();
    if (pedalNode) {
      try { (pedalNode as any).disconnect(); } catch (e) {}
    }
    
    const cabinetChain = getCabinetChain();
    if (cabinetChain && cabinetEnabled) {
      cabinetChain.forEach(node => {
        try { (node as any)?.disconnect(); } catch (e) {}
      });
    }
    
    if (useDirectMode) {
      mic.current.connect(Tone.Destination);
    } else {
      const currentPedalNode = getPedalNode();
      const currentCabinetChain = getCabinetChain();
      
      let currentOutput: Tone.ToneAudioNode = mic.current;
      
      if (currentPedalNode && pedalEnabled) {
        currentOutput.connect(currentPedalNode as any);
        currentOutput = currentPedalNode as any;
      }
      
      if (distortion.current && eq.current) {
        currentOutput.connect(distortion.current);
        distortion.current.connect(eq.current);
        currentOutput = eq.current;
      }
      
      if (currentCabinetChain && cabinetEnabled && currentCabinetChain[0] && currentCabinetChain[3]) {
        currentOutput.connect(currentCabinetChain[0]);
        currentOutput = currentCabinetChain[3]; 
      }
      
      if (reverb.current && volume.current) {
        currentOutput.connect(reverb.current);
        reverb.current.connect(volume.current);
        volume.current.connect(Tone.Destination);
      }
    }
  }, [useDirectMode, isEngineStarted, pedalEnabled, cabinetEnabled, getPedalNode, getCabinetChain]);

  // Real-time Param Updates
  useEffect(() => { if (distortion.current) distortion.current.distortion = distortionValue; }, [distortionValue]);
  useEffect(() => {
    if (eq.current) {
      eq.current.low.value = bassValue;
      eq.current.mid.value = midValue;
      eq.current.high.value = trebleValue;
    }
  }, [bassValue, midValue, trebleValue]);
  useEffect(() => { if (volume.current) volume.current.volume.value = volumeValue; }, [volumeValue]);
  useEffect(() => { if (reverb.current) reverb.current.wet.value = reverbValue; }, [reverbValue]);

  const togglePower = async () => {
    if (!isEngineStarted && mic.current) {
      await Tone.start();
      try {
        await mic.current.open();
        setIsEngineStarted(true);
      } catch (e) {
        console.error("Interface access error", e);
      }
    } else if (mic.current) {
      mic.current.close();
      setIsEngineStarted(false);
    }
  };

  useEffect(() => {
    const loadDaws = async () => {
      try {
        const daws = await dawAPI.getAllDaws();
        setSavedDaws(daws);
      } catch (error) {
        console.error('Error loading DAWs:', error);
      }
    };
    loadDaws();
  }, []);

  const handleSavePreset = async () => {
    if (!dawName.trim() || !configName.trim()) {
      alert('Enter names'); return;
    }
    try {
      const dawDTO = buildDawDTOFromPreset(
        dawName, userId, configName,
        { enabled: pedalEnabled, reverbMix: pedalReverbMix, reverbRoomSize: pedalReverbRoomSize },
        { distortionValue, bassValue, midValue, trebleValue, reverbValue, volumeValue },
        { enabled: cabinetEnabled, cabinetLowCut, cabinetHighCut, cabinetPresence }
      );
      const saved = await dawAPI.saveDaw(dawDTO);
      setSavedDaws([...savedDaws, saved]);
      setShowPresetDialog(false);
    } catch (e) { console.error(e); }
  };

  const handleLoadPreset = async (dawId: string) => {
    try {
      const daw = await dawAPI.getDawById(dawId);
      const firstConfig = daw.listOfConfigs?.[0];
      if (!firstConfig?.componentChain) return;

      applyPresetFromComponentDTOs(firstConfig.componentChain, {
        setPedalEnabled, setPedalReverbMix, setPedalReverbRoomSize,
        setDistortionValue, setBassValue, setMidValue, setTrebleValue,
        setReverbValue, setVolumeValue, setCabinetEnabled,
        setCabinetLowCut, setCabinetHighCut, setCabinetPresence,
      });
      setShowPresetDialog(false);
    } catch (e) { console.error(e); }
  };

  // Internal Slider Component
  const Slider: FC<SliderProps> = ({ label, value, min, max, step, onChange, unit = '' }) => (
    <div className="slider-container">
      <div className="slider-header">
        <div className="slider-label">{label}</div>
        <div className="slider-value">{value.toFixed(1)}{unit}</div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-input"
      />
    </div>
  );

  return (
    <div className="demo">
      {/* ... Your JSX remains mostly the same, ensuring styles are correctly typed objects ... */}
      <h1>ToneJS Amp Demo</h1>
      <button onClick={togglePower}>{isEngineStarted ? "OFF" : "ON"}</button>
      {/* Render logic continues... */}
    </div>
  );
};

export default TonejsDemo;