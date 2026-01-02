import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { NAMNode } from './NAMAudioWorklet';

/**
 * Custom hook for Neural Amp Modeler (NAM) integration
 * 
 * This hook loads and initializes a NAM model from a .nam file
 * and provides a Tone.js compatible audio node for real-time processing.
 */
export const useNAMAmp = (namFilePath, enabled = true) => {
  const [isNAMLoaded, setIsNAMLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [namMetadata, setNamMetadata] = useState(null);
  const namNodeRef = useRef(null);
  
  // Fallback amp nodes (used when NAM is not available or disabled)
  const distortionRef = useRef(null);
  const eqRef = useRef(null);

  useEffect(() => {
    if (!enabled || !namFilePath) {
      // Use fallback amp simulation
      if (!distortionRef.current) {
        distortionRef.current = new Tone.Distortion(0.4);
        eqRef.current = new Tone.EQ3({
          low: 0,
          mid: 0,
          high: 0
        });
      }
      
      setIsNAMLoaded(false);
      setLoadingError(null);
      
      return () => {
        distortionRef.current?.dispose();
        eqRef.current?.dispose();
        distortionRef.current = null;
        eqRef.current = null;
      };
    }

    // Load and initialize NAM model
    const loadNAMModel = async () => {
      setIsLoading(true);
      setLoadingError(null);
      setIsNAMLoaded(false);

      try {
        // Dispose of previous NAM node if it exists
        if (namNodeRef.current) {
          namNodeRef.current.dispose();
          namNodeRef.current = null;
        }

        // Create new NAM node
        const namNode = new NAMNode(namFilePath);
        namNodeRef.current = namNode;

        // Initialize the NAM node (loads WASM and NAM file)
        await namNode.initialize();
        
        // Extract metadata from the node
        if (namNode.metadata) {
          setNamMetadata(namNode.metadata);
        }
        
        setIsNAMLoaded(true);
        setLoadingError(null);
        console.log('NAM model loaded successfully:', namFilePath, namNode.metadata);
      } catch (error) {
        console.error('Error loading NAM model:', error);
        setLoadingError(error.message || 'Failed to load NAM model');
        setIsNAMLoaded(false);
        
        // Fallback to Tone.js amp simulation
        if (!distortionRef.current) {
          distortionRef.current = new Tone.Distortion(0.4);
          eqRef.current = new Tone.EQ3({
            low: 0,
            mid: 0,
            high: 0
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadNAMModel();

    return () => {
      if (namNodeRef.current) {
        namNodeRef.current.dispose();
        namNodeRef.current = null;
      }
      distortionRef.current?.dispose();
      eqRef.current?.dispose();
      distortionRef.current = null;
      eqRef.current = null;
    };
  }, [namFilePath, enabled]);

  // Get the amp processing chain
  // Returns NAM node if loaded, otherwise returns fallback nodes
  const getAmpChain = () => {
    if (isNAMLoaded && namNodeRef.current && enabled) {
      // Return NAM processing node
      return [namNodeRef.current];
    } else {
      // Return fallback chain: distortion -> EQ
      if (distortionRef.current && eqRef.current) {
        distortionRef.current.connect(eqRef.current);
        return [distortionRef.current, eqRef.current];
      }
      return null;
    }
  };

  // Get the NAM node directly (for more advanced usage)
  const getNAMNode = () => {
    if (isNAMLoaded && namNodeRef.current) {
      return namNodeRef.current;
    }
    return null;
  };

  // Update distortion (fallback only)
  const updateDistortion = (value) => {
    if (distortionRef.current) {
      distortionRef.current.distortion = value;
    }
  };

  // Update EQ (fallback only)
  const updateEQ = (bass, mid, treble) => {
    if (eqRef.current) {
      eqRef.current.low.value = bass;
      eqRef.current.mid.value = mid;
      eqRef.current.high.value = treble;
    }
  };

  // Update NAM input gain
  const updateInputGain = (value) => {
    if (namNodeRef.current && namNodeRef.current.setInputGain) {
      namNodeRef.current.setInputGain(value);
    }
  };

  // Update NAM output gain
  const updateOutputGain = (value) => {
    if (namNodeRef.current && namNodeRef.current.setOutputGain) {
      namNodeRef.current.setOutputGain(value);
    }
  };

  return {
    getAmpChain,
    getNAMNode,
    isNAMLoaded,
    isLoading,
    loadingError,
    namMetadata,
    updateDistortion,
    updateEQ,
    updateInputGain,
    updateOutputGain,
    nodes: {
      distortion: distortionRef.current,
      eq: eqRef.current,
      nam: namNodeRef.current
    }
  };
};

