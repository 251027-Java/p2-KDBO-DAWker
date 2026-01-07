/* 
 * TONE.JS CODE COMMENTED OUT - Using Native Web Audio API only
 * This file is kept for reference but is not used in the application.
 * Cabinet functionality is now handled in NativeAmpDemo.tsx using native Web Audio API.
 */

/*
import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

/**
 * Custom hook for Cabinet simulation
 * Returns audio nodes that can be chained in the signal path
 * Separate entity from amp - positioned after amp in signal chain
 */

export const useCabinet = (enabled, lowCut, highCut, presence) => {
  const highPass = useRef(null);
  const convolver = useRef(null);
  const lowPass = useRef(null);
  const presenceFilter = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (convolver.current) {
        convolver.current.dispose();
        convolver.current = null;
      }
      if (lowPass.current) {
        lowPass.current.dispose();
        lowPass.current = null;
      }
      if (highPass.current) {
        highPass.current.dispose();
        highPass.current = null;
      }
      if (presenceFilter.current) {
        presenceFilter.current.dispose();
        presenceFilter.current = null;
      }
      return;
    }

    // removes sub bass (sims cabinet resonance)
    if (!highPass.current) {
      highPass.current = new Tone.Filter({
        type: 'highpass',
        frequency: lowCut,
        Q: 1
      });
    }

    // removes harsh highs (sims speaker roll off)
    if (!lowPass.current) {
      lowPass.current = new Tone.Filter({
        type: 'lowpass',
        frequency: highCut,
        Q: 1
      });
    }

    // presence filter for cabinet character (mid-high frequency emphasis)
    if (!presenceFilter.current) {
      presenceFilter.current = new Tone.Filter({
        type: 'peaking',
        frequency: 2000,
        Q: 1,
        gain: presence
      });
    }

    // impulse response buffer for convolver (sims frequency response and resonance)
    if (!convolver.current) {
      const sampleRate = Tone.context.sampleRate;
      const length = Math.floor(sampleRate * 0.1); // 100ms IR
      const impulse = Tone.context.createBuffer(2, length, sampleRate);
      
      // IR
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          // exponential decay
          const decay = Math.exp(-i / (sampleRate * 0.05));
          const resonance = Math.sin(i * 2 * Math.PI * 100 / sampleRate) * 0.3;
          channelData[i] = (decay + resonance) * 0.1;
        }
      }

      convolver.current = new Tone.Convolver({
        buffer: impulse,
        normalize: true
      });

      // highPass -> convolver -> lowPass -> presence
      highPass.current.connect(convolver.current);
      convolver.current.connect(lowPass.current);
      lowPass.current.connect(presenceFilter.current);
    }

    return () => {
      if (convolver.current) {
        convolver.current.dispose();
        convolver.current = null;
      }
      if (lowPass.current) {
        lowPass.current.dispose();
        lowPass.current = null;
      }
      if (highPass.current) {
        highPass.current.dispose();
        highPass.current = null;
      }
      if (presenceFilter.current) {
        presenceFilter.current.dispose();
        presenceFilter.current = null;
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (lowPass.current && enabled) {
      lowPass.current.frequency.value = highCut;
    }
  }, [highCut, enabled]);

  useEffect(() => {
    if (highPass.current && enabled) {
      highPass.current.frequency.value = lowCut;
    }
  }, [lowCut, enabled]);

  useEffect(() => {
    if (presenceFilter.current && enabled) {
      presenceFilter.current.gain.value = presence;
    }
  }, [presence, enabled]);

  const getChain = useCallback(() => {
    if (!enabled || !highPass.current || !convolver.current || !lowPass.current || !presenceFilter.current) {
      return null;
    }
    return [highPass.current, convolver.current, lowPass.current, presenceFilter.current];
  }, [enabled]);

  return {
    getChain,
    nodes: {
      highPass: highPass.current,
      convolver: convolver.current,
      lowPass: lowPass.current,
      presence: presenceFilter.current
    }
  };
};
*/
