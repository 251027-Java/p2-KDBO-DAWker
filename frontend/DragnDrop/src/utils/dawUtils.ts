// types.ts structure: DawDTO -> ConfigDTO -> ComponentDTO -> SettingsDTO
import { DawDTO, ConfigDTO, ComponentDTO, SettingsDTO } from '../dtos/types';

// builds componentDTOs from pedal, amp, and cabinet settings
// each component stores its settings in SettingsDTO.parameters
export function buildComponentDTOsFromPreset(
  pedalState: {
    enabled: boolean;
    reverbMix: number;
    reverbRoomSize: number;
  },
  ampState: {
    distortionValue: number;
    bassValue: number;
    midValue: number;
    trebleValue: number;
    reverbValue: number;
    volumeValue: number;
  },
  cabinetState: {
    enabled: boolean;
    cabinetLowCut: number;
    cabinetHighCut: number;
    cabinetPresence: number;
  }
): ComponentDTO[] {
  const components: ComponentDTO[] = [];

  // comes first in signal chain
  if (pedalState.enabled) {
    components.push({
      instanceId: `pedal-${Date.now()}`,
      configId: 0, // will be set by parent config
      name: 'Pedal',
      type: 'reverb',
      settings: {
        Technology: 'TONEJS',
        export_name: 'pedal-reverb',
        parameters: {
          enabled: pedalState.enabled,
          reverbMix: pedalState.reverbMix,
          reverbRoomSize: pedalState.reverbRoomSize,
        },
      },
    });
  }

  // comes after pedal
  components.push({
    instanceId: `amp-${Date.now()}`,
    configId: 0,
    name: 'Amp',
    type: 'distortion',
    settings: {
      Technology: 'TONEJS',
      export_name: 'amp-simulation',
      parameters: {
        distortionValue: ampState.distortionValue,
        bassValue: ampState.bassValue,
        midValue: ampState.midValue,
        trebleValue: ampState.trebleValue,
        reverbValue: ampState.reverbValue,
        volumeValue: ampState.volumeValue,
      },
    },
  });

  // comes after amp
  if (cabinetState.enabled) {
    components.push({
      instanceId: `cabinet-${Date.now()}`,
      configId: 0,
      name: 'Cabinet',
      type: 'filter',
      settings: {
        Technology: 'TONEJS',
        export_name: 'cabinet-simulation',
        parameters: {
          enabled: cabinetState.enabled,
          cabinetLowCut: cabinetState.cabinetLowCut,
          cabinetHighCut: cabinetState.cabinetHighCut,
          cabinetPresence: cabinetState.cabinetPresence,
        },
      },
    });
  }

  return components;
}

// builds configDTO containing pedal/amp/cabinet components
export function buildConfigDTOFromPreset(
  configId: number,
  configName: string,
  pedalState: {
    enabled: boolean;
    reverbMix: number;
    reverbRoomSize: number;
  },
  ampState: {
    distortionValue: number;
    bassValue: number;
    midValue: number;
    trebleValue: number;
    reverbValue: number;
    volumeValue: number;
  },
  cabinetState: {
    enabled: boolean;
    cabinetLowCut: number;
    cabinetHighCut: number;
    cabinetPresence: number;
  }
): ConfigDTO {
  const components = buildComponentDTOsFromPreset(pedalState, ampState, cabinetState);

  return {
    id: configId,
    name: configName,
    components,
  };
}

// builds complete dawDTO with single config containing preset
export function buildDawDTOFromPreset(
  dawName: string,
  userId: number,
  configId: number,
  configName: string,
  pedalState: {
    enabled: boolean;
    reverbMix: number;
    reverbRoomSize: number;
  },
  ampState: {
    distortionValue: number;
    bassValue: number;
    midValue: number;
    trebleValue: number;
    reverbValue: number;
    volumeValue: number;
  },
  cabinetState: {
    enabled: boolean;
    cabinetLowCut: number;
    cabinetHighCut: number;
    cabinetPresence: number;
  }
): DawDTO {
  const config = buildConfigDTOFromPreset(configId, configName, pedalState, ampState, cabinetState);

  return {
    dawId: `daw-${Date.now()}`,
    userId,
    name: dawName,
    listOfConfigs: [config],
  };
}

// extracts pedal, amp, and cabinet settings from componentDTO array
// used when loading a daw configuration
export function extractPresetFromComponentDTOs(components: ComponentDTO[]): {
  pedal: {
    enabled: boolean;
    reverbMix: number;
    reverbRoomSize: number;
  };
  amp: {
    distortionValue: number;
    bassValue: number;
    midValue: number;
    trebleValue: number;
    reverbValue: number;
    volumeValue: number;
  };
  cabinet: {
    enabled: boolean;
    cabinetLowCut: number;
    cabinetHighCut: number;
    cabinetPresence: number;
  };
} | null {
  const pedalComponent = components.find(c => c.name === 'Pedal');
  const ampComponent = components.find(c => c.name === 'Amp');
  const cabinetComponent = components.find(c => c.name === 'Cabinet');

  if (!ampComponent) {
    return null; // amp is required
  }

  const params = (key: string, defaultValue: any) => {
    return ampComponent.settings?.parameters[key] ?? defaultValue;
  };

  const pedalParams = (key: string, defaultValue: any) => {
    return pedalComponent?.settings?.parameters[key] ?? defaultValue;
  };

  const cabinetParams = (key: string, defaultValue: any) => {
    return cabinetComponent?.settings?.parameters[key] ?? defaultValue;
  };

  return {
    pedal: {
      enabled: pedalComponent ? (pedalParams('enabled', true) as boolean) : false,
      reverbMix: pedalParams('reverbMix', 0.8) as number,
      reverbRoomSize: pedalParams('reverbRoomSize', 0.9) as number,
    },
    amp: {
      distortionValue: params('distortionValue', 0.4) as number,
      bassValue: params('bassValue', 0) as number,
      midValue: params('midValue', 0) as number,
      trebleValue: params('trebleValue', 0) as number,
      reverbValue: params('reverbValue', 0.3) as number,
      volumeValue: params('volumeValue', -6) as number,
    },
    cabinet: {
      enabled: cabinetComponent ? (cabinetParams('enabled', true) as boolean) : false,
      cabinetLowCut: cabinetParams('cabinetLowCut', 80) as number,
      cabinetHighCut: cabinetParams('cabinetHighCut', 8000) as number,
      cabinetPresence: cabinetParams('cabinetPresence', 0) as number,
    },
  };
}

// applies preset settings from componentDTOs to component state setters
export function applyPresetFromComponentDTOs(
  components: ComponentDTO[],
  setters: {
    setPedalEnabled: (value: boolean) => void;
    setPedalReverbMix: (value: number) => void;
    setPedalReverbRoomSize: (value: number) => void;
    setDistortionValue: (value: number) => void;
    setBassValue: (value: number) => void;
    setMidValue: (value: number) => void;
    setTrebleValue: (value: number) => void;
    setReverbValue: (value: number) => void;
    setVolumeValue: (value: number) => void;
    setCabinetEnabled: (value: boolean) => void;
    setCabinetLowCut: (value: number) => void;
    setCabinetHighCut: (value: number) => void;
    setCabinetPresence: (value: number) => void;
  }
): boolean {
  const preset = extractPresetFromComponentDTOs(components);
  if (!preset) {
    return false;
  }

  // apply pedal settings
  setters.setPedalEnabled(preset.pedal.enabled);
  setters.setPedalReverbMix(preset.pedal.reverbMix);
  setters.setPedalReverbRoomSize(preset.pedal.reverbRoomSize);

  // apply amp settings
  setters.setDistortionValue(preset.amp.distortionValue);
  setters.setBassValue(preset.amp.bassValue);
  setters.setMidValue(preset.amp.midValue);
  setters.setTrebleValue(preset.amp.trebleValue);
  setters.setReverbValue(preset.amp.reverbValue);
  setters.setVolumeValue(preset.amp.volumeValue);

  // apply cabinet settings
  setters.setCabinetEnabled(preset.cabinet.enabled);
  setters.setCabinetLowCut(preset.cabinet.cabinetLowCut);
  setters.setCabinetHighCut(preset.cabinet.cabinetHighCut);
  setters.setCabinetPresence(preset.cabinet.cabinetPresence);

  return true;
}

// ========== NATIVE WEB AUDIO API AMP UTILITIES ==========

// builds componentDTOs from native amp state (input gain, distortion, EQ, reverb, volume)
export function buildComponentDTOsFromNativeAmpState(
  //component specific
  componentId: number | undefined,
  instanceId: string | undefined,
  componentName: string | undefined,
  componentType: string | undefined,
  
  // Settings
  settingsId: number | undefined,
  settingsTechnology: string | undefined,
  settingsExportName: string | undefined,

  ampState: {
    inputGain: number;
    directMode: boolean;
    distortionAmount: number;
    bassValue: number;
    midValue: number;
    trebleValue: number;
    reverbAmount: number;
    volumeValue: number;
  }
): ComponentDTO[] {
  const components: ComponentDTO[] = [];

  // Single amp component containing all native amp settings
  components.push({
    instanceId: instanceId,
    configId: 0, // will be set by parent config
    name: 'NativeAmp',
    type: 'distortion',
    settings: {
      Technology: 'TONEJS', // Using TONEJS even though it's native Web Audio API
      export_name: 'native-web-audio-amp',
      parameters: {
        inputGain: ampState.inputGain,
        directMode: ampState.directMode,
        distortionAmount: ampState.distortionAmount,
        bassValue: ampState.bassValue,
        midValue: ampState.midValue,
        trebleValue: ampState.trebleValue,
        reverbAmount: ampState.reverbAmount,
        volumeValue: ampState.volumeValue,
      },
    },
  });

  return components;
}

// builds configDTO containing native amp component
export function buildConfigDTOFromNativeAmpState(
  configId: number | undefined,
  configName: string | undefined,

  //component specific
  componentId: number | undefined,
  instanceId: string | undefined,
  componentName: string | undefined,
  componentType: string | undefined,
  
  // Settings
  settingsId: number | undefined,
  settingsTechnology: string | undefined,
  settingsExportName: string | undefined,
  ampState: {
    inputGain: number;
    directMode: boolean;
    distortionAmount: number;
    bassValue: number;
    midValue: number;
    trebleValue: number;
    reverbAmount: number;
    volumeValue: number;
  }
): ConfigDTO {
  const components = buildComponentDTOsFromNativeAmpState(
    componentId = componentId,
    instanceId = instanceId,
    componentName = componentName,
    componentType = componentType,
    settingsId = settingsId,
    settingsTechnology = settingsTechnology,
    settingsExportName = settingsExportName,
    ampState);


  return {
    id: configId,
    name: configName,
    components,
  };
    console.log("This is within the config function. Wanting to see how config is saved")
    console.log(configName)
}

// builds complete dawDTO with single config containing native amp preset
export function buildDawDTOFromNativeAmpState(
  //Daw specific
  dawId: string | undefined,
  dawName: string | undefined,
  dawDescription: string | undefined,
  exportCount: number | undefined,
  createdAt: Date | undefined,
  userId: number | undefined,

  //Config specific
  configName: string | undefined,
  configId: number | undefined,

  //component specific
  componentId: number | undefined,
  instanceId: string | undefined,
  componentName: string | undefined,
  componentType: string | undefined,
  
  // Settings
  settingsId: number | undefined,
  settingsTechnology: string | undefined,
  settingsExportName: string | undefined,
  ampState: {
    inputGain: number;
    directMode: boolean;
    distortionAmount: number;
    bassValue: number;
    midValue: number;
    trebleValue: number;
    reverbAmount: number;
    volumeValue: number;
  }
): DawDTO {
  const config = buildConfigDTOFromNativeAmpState(
    configId = configId, 
    configName = configName,
    componentId = componentId,
    instanceId = instanceId,
    componentName = componentName,
    componentType = componentType,
    settingsId = settingsId,
    settingsTechnology = settingsTechnology,
    settingsExportName = settingsExportName, 
    ampState = ampState);

  console.log("This is within the config function. Wanting to see how config is saved")
  console.log(configName)

  return {
    dawId: dawId,
    userId: userId,
    description: dawDescription,
    name: dawName,
    exportCount: exportCount,
    createdAt: createdAt,
    listOfConfigs: [config]
  };

}

// extracts native amp settings from componentDTO array
export function extractNativeAmpStateFromComponentDTOs(components: ComponentDTO[]): {
  inputGain: number;
  directMode: boolean;
  distortionAmount: number;
  bassValue: number;
  midValue: number;
  trebleValue: number;
  reverbAmount: number;
  volumeValue: number;
} | null {
  const ampComponent = components.find(c => c.name === 'NativeAmp');

  if (!ampComponent) {
    return null;
  }

  const params = (key: string, defaultValue: any) => {
    return ampComponent.settings?.parameters[key] ?? defaultValue;
  };

  return {
    inputGain: params('inputGain', 5.0) as number,
    directMode: params('directMode', false) as boolean,
    distortionAmount: params('distortionAmount', 0.5) as number,
    bassValue: params('bassValue', 0) as number,
    midValue: params('midValue', 0) as number,
    trebleValue: params('trebleValue', 0) as number,
    reverbAmount: params('reverbAmount', 0.3) as number,
    volumeValue: params('volumeValue', -6) as number,
  };
}

// applies native amp preset settings from componentDTOs to component state setters
export function applyNativeAmpStateFromComponentDTOs(
  components: ComponentDTO[],
  setters: {
    setInputGain: (value: number) => void;
    setDirectMode: (value: boolean) => void;
    setDistortionAmount: (value: number) => void;
    setBassValue: (value: number) => void;
    setMidValue: (value: number) => void;
    setTrebleValue: (value: number) => void;
    setReverbAmount: (value: number) => void;
    setVolumeValue: (value: number) => void;
  }
): boolean {
  const state = extractNativeAmpStateFromComponentDTOs(components);
  if (!state) {
    return false;
  }

  setters.setInputGain(state.inputGain);
  setters.setDirectMode(state.directMode);
  setters.setDistortionAmount(state.distortionAmount);
  setters.setBassValue(state.bassValue);
  setters.setMidValue(state.midValue);
  setters.setTrebleValue(state.trebleValue);
  setters.setReverbAmount(state.reverbAmount);
  setters.setVolumeValue(state.volumeValue);

  return true;
}

