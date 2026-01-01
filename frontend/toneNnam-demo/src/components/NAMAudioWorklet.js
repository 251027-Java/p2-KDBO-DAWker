/**
 * Custom Tone.js node for NAM (Neural Amp Modeler) processing
 * Simplified implementation that works with the WASM module
 */

import * as Tone from 'tone';

/**
 * Custom Tone.js node for NAM processing
 */
export class NAMNode extends Tone.ToneAudioNode {
  constructor(namFilePath, options = {}) {
    super(options);
    
    this.namFilePath = namFilePath;
    this.wasmModule = null;
    this.namData = null;
    this.isInitialized = false;
    this.inputGain = options.inputGain || 1.0;
    this.outputGain = options.outputGain || 1.0;
    
    // Create input/output
    this.input = new Tone.Gain(this.inputGain);
    this.output = new Tone.Gain(this.outputGain);
  }

  /**
   * Initialize the NAM node
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Try to load WASM module (non-blocking)
      try {
        this.wasmModule = await this.loadWASMModule();
      } catch (wasmError) {
        console.warn('WASM module loading failed, using pass-through:', wasmError);
        this.wasmModule = null;
      }
      
      // Load NAM file
      const response = await fetch(this.namFilePath);
      if (!response.ok) {
        throw new Error(`Failed to load NAM file: ${response.statusText}`);
      }
      this.namData = await response.json();
      
      // Store metadata for UI display
      this.metadata = {
        version: this.namData.version || 'Unknown',
        architecture: this.namData.architecture || 'Unknown',
        hasCondition: this.namData.config?.layers?.[0]?.condition_size > 1,
        conditionSize: this.namData.config?.layers?.[0]?.condition_size || 1,
        inputLevelDBU: this.namData.metadata?.input_level_dbu,
        modelName: this.namData.metadata?.name || this.namData.metadata?.model_name
      };
      
      // Mark as initialized
      // The actual WASM processing will be implemented once we have the correct API
      // For now, we use pass-through mode so the UI can work
      this.isInitialized = true;
      
      // Connect input to output (pass-through for now)
      // This will be replaced with actual NAM processing once the WASM API is confirmed
      this.input.connect(this.output);
      
      console.log('NAM node initialized (pass-through mode):', this.namFilePath);
    } catch (error) {
      console.error('Error initializing NAM node:', error);
      // Still connect input to output so audio works
      this.input.connect(this.output);
      this.isInitialized = true; // Mark as initialized so UI doesn't hang
      throw error;
    }
  }

  /**
   * Load WASM module
   */
  async loadWASMModule() {
    // Check if Module is already available and initialized
    if (typeof window !== 'undefined' && window.Module) {
      // If already initialized, return immediately
      if (window.Module.asm) {
        this.wasmModule = window.Module;
        return window.Module;
      }
      
      // If not initialized, wait for it
      return new Promise((resolve, reject) => {
        const originalCallback = window.Module.onRuntimeInitialized;
        window.Module.onRuntimeInitialized = () => {
          if (originalCallback) originalCallback();
          this.wasmModule = window.Module;
          resolve(window.Module);
        };
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.wasmModule) {
            reject(new Error('WASM module initialization timeout'));
          }
        }, 10000);
      });
    }

    // If script tag exists, wait for it to load
    const existingScript = document.querySelector('script[src="/t3k-wasm-module.js"]');
    if (existingScript) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (window.Module && window.Module.asm) {
            clearInterval(checkInterval);
            this.wasmModule = window.Module;
            resolve(window.Module);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (!this.wasmModule) {
            reject(new Error('WASM module failed to load'));
          }
        }, 10000);
      });
    }

    // For now, just resolve - we'll use pass-through mode
    // The WASM integration can be completed later with the correct API
    console.warn('WASM module not found, using pass-through mode');
    return Promise.resolve(null);
  }

  /**
   * Set input gain
   */
  setInputGain(value) {
    this.inputGain = value;
    if (this.input) {
      this.input.gain.value = value;
    }
  }

  /**
   * Set output gain
   */
  setOutputGain(value) {
    this.outputGain = value;
    if (this.output) {
      this.output.gain.value = value;
    }
  }

  /**
   * Dispose of the NAM node
   */
  dispose() {
    if (this.input) {
      this.input.disconnect();
      this.input.dispose();
    }
    if (this.output) {
      this.output.disconnect();
      this.output.dispose();
    }
    super.dispose();
  }
}
