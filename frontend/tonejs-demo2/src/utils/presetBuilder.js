/**
 * Utility functions for building preset DTOs from component state
 * This converts the React state values into the format expected by the backend PresetDTO
 */

/**
 * Builds a PresetDTO object from the current DAW state
 * @param {Object} state - The state object containing all DAW parameters
 * @param {string} presetName - Name for the preset
 * @returns {Object} PresetDTO object matching backend structure
 */
export const buildPresetDTO = (state, presetName = 'My Preset') => {
  return {
    presetName: presetName,
    pedal: {
      enabled: state.pedalEnabled ?? true,
      reverbMix: state.pedalReverbMix ?? 0.8,
      reverbRoomSize: state.pedalReverbRoomSize ?? 0.9,
    },
    amp: {
      distortionValue: state.distortionValue ?? 0.4,
      bassValue: state.bassValue ?? 0.0,
      midValue: state.midValue ?? 0.0,
      trebleValue: state.trebleValue ?? 0.0,
      reverbValue: state.reverbValue ?? 0.3,
      volumeValue: state.volumeValue ?? -6.0,
    },
    cabinet: {
      enabled: state.cabinetEnabled ?? true,
      cabinetLowCut: state.cabinetLowCut ?? 80,
      cabinetHighCut: state.cabinetHighCut ?? 8000,
      cabinetPresence: state.cabinetPresence ?? 0.0,
    },
  };
};

/**
 * Extracts the current state from a component's state variables
 * This is a helper function to collect all relevant state into one object
 */
export const extractStateFromComponent = (componentState) => {
  return {
    pedalEnabled: componentState.pedalEnabled,
    pedalReverbMix: componentState.pedalReverbMix,
    pedalReverbRoomSize: componentState.pedalReverbRoomSize,
    distortionValue: componentState.distortionValue,
    bassValue: componentState.bassValue,
    midValue: componentState.midValue,
    trebleValue: componentState.trebleValue,
    reverbValue: componentState.reverbValue,
    volumeValue: componentState.volumeValue,
    cabinetEnabled: componentState.cabinetEnabled,
    cabinetLowCut: componentState.cabinetLowCut,
    cabinetHighCut: componentState.cabinetHighCut,
    cabinetPresence: componentState.cabinetPresence,
  };
};

/**
 * Loads preset data back into component state
 * This is useful for loading saved presets
 * @param {Object} presetDTO - The PresetDTO from the backend
 * @returns {Object} State object that can be used to update component state
 */
export const presetDTOToState = (presetDTO) => {
  return {
    pedalEnabled: presetDTO.pedal?.enabled ?? true,
    pedalReverbMix: presetDTO.pedal?.reverbMix ?? 0.8,
    pedalReverbRoomSize: presetDTO.pedal?.reverbRoomSize ?? 0.9,
    distortionValue: presetDTO.amp?.distortionValue ?? 0.4,
    bassValue: presetDTO.amp?.bassValue ?? 0.0,
    midValue: presetDTO.amp?.midValue ?? 0.0,
    trebleValue: presetDTO.amp?.trebleValue ?? 0.0,
    reverbValue: presetDTO.amp?.reverbValue ?? 0.3,
    volumeValue: presetDTO.amp?.volumeValue ?? -6.0,
    cabinetEnabled: presetDTO.cabinet?.enabled ?? true,
    cabinetLowCut: presetDTO.cabinet?.cabinetLowCut ?? 80,
    cabinetHighCut: presetDTO.cabinet?.cabinetHighCut ?? 8000,
    cabinetPresence: presetDTO.cabinet?.cabinetPresence ?? 0.0,
  };
};

