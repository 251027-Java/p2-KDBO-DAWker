/**
 * NAM (Neural Amp Modeler) Loader Utility
 * Handles loading WASM module and .nam files for real-time audio processing
 */

let wasmModule = null;
let wasmModulePromise = null;

/**
 * Initialize and load the WASM module
 * @returns {Promise<Object>} The loaded WASM module
 */
export async function loadWASMModule() {
  if (wasmModule) {
    return wasmModule;
  }

  if (wasmModulePromise) {
    return wasmModulePromise;
  }

  wasmModulePromise = new Promise((resolve, reject) => {
    // Check if Module is already available (from t3k-wasm-module.js)
    if (typeof window !== 'undefined' && window.Module) {
      const Module = window.Module;
      
      // Configure module options
      Module.locateFile = (path) => {
        if (path.endsWith('.wasm')) {
          return `/t3k-wasm-module.wasm`;
        }
        return `/${path}`;
      };

      Module.onRuntimeInitialized = () => {
        wasmModule = Module;
        resolve(Module);
      };

      // If already initialized
      if (Module.asm) {
        wasmModule = Module;
        resolve(Module);
      }
    } else {
      // Dynamically load the WASM module script
      const script = document.createElement('script');
      script.src = '/t3k-wasm-module.js';
      script.async = true;
      
      script.onload = () => {
        if (window.Module) {
          const Module = window.Module;
          Module.locateFile = (path) => {
            if (path.endsWith('.wasm')) {
              return `/t3k-wasm-module.wasm`;
            }
            return `/${path}`;
          };

          Module.onRuntimeInitialized = () => {
            wasmModule = Module;
            resolve(Module);
          };

          // If already initialized
          if (Module.asm) {
            wasmModule = Module;
            resolve(Module);
          }
        } else {
          reject(new Error('WASM module not found'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load WASM module script'));
      };

      document.head.appendChild(script);
    }
  });

  return wasmModulePromise;
}

/**
 * Load and parse a .nam file
 * @param {string} namFilePath - Path to the .nam file
 * @returns {Promise<Object>} Parsed NAM model data
 */
export async function loadNAMFile(namFilePath) {
  try {
    const response = await fetch(namFilePath);
    if (!response.ok) {
      throw new Error(`Failed to load NAM file: ${response.statusText}`);
    }

    const namData = await response.json();
    
    // Validate NAM file structure
    if (!namData.architecture) {
      throw new Error('Invalid NAM file: missing architecture');
    }

    return namData;
  } catch (error) {
    console.error('Error loading NAM file:', error);
    throw error;
  }
}

/**
 * Initialize NAM model in WASM module
 * @param {Object} Module - The WASM module
 * @param {Object} namData - Parsed NAM file data
 * @returns {number} DSP handle/pointer
 */
export function initializeNAMModel(Module, namData) {
  try {
    // Convert NAM data to a format the WASM module can use
    // The exact API depends on the NeuralAmpModelerCore implementation
    // This is a placeholder that needs to be adjusted based on the actual WASM API
    
    // Allocate memory for the model data
    const modelJson = JSON.stringify(namData);
    const modelJsonPtr = Module.stringToUTF8(modelJson);
    const modelJsonLen = Module.lengthBytesUTF8(modelJson);
    
    // Call the WASM function to set up the DSP
    // The actual function name and signature may vary
    // Based on the WASM module, it likely has a function like _setDsp
    if (typeof Module._setDsp === 'function') {
      const dspHandle = Module._setDsp(modelJsonPtr, modelJsonLen);
      return dspHandle;
    } else {
      throw new Error('WASM module does not have _setDsp function');
    }
  } catch (error) {
    console.error('Error initializing NAM model:', error);
    throw error;
  }
}

/**
 * Get the sample rate from the audio context
 * @returns {number} Sample rate
 */
export function getSampleRate() {
  if (typeof window !== 'undefined' && window.AudioContext) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const sr = ctx.sampleRate;
    ctx.close();
    return sr;
  }
  return 44100; // Default
}

