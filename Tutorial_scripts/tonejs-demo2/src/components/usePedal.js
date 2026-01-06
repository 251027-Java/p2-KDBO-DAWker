import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

export const usePedal = (enabled, reverbMix, reverbRoomSize) => {
  const reverb = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (reverb.current) {
        reverb.current.dispose();
        reverb.current = null;
      }
      return;
    }

    // large roomSize and high wet mix for lots of reverb
    // roomSize can only be set during initialization, so we need to recreate
    // the reverb when roomSize changes
    const createReverb = async () => {
      if (reverb.current) {
        reverb.current.dispose();
      }
      
      reverb.current = new Tone.Reverb({
        roomSize: reverbRoomSize,
        wet: reverbMix
      });
      
      // generate the reverb impulse response
      try {
        await reverb.current.generate();
      } catch (err) {
        console.error('Error generating reverb:', err);
      }
    };

    createReverb();

    return () => {
      if (reverb.current) {
        reverb.current.dispose();
        reverb.current = null;
      }
    };
  }, [enabled, reverbRoomSize]); // regenerate when roomSize changes

  useEffect(() => {
    if (reverb.current && enabled) {
      reverb.current.wet.value = reverbMix;
    }
  }, [reverbMix, enabled]);

  const getPedalNode = useCallback(() => {
    if (!enabled || !reverb.current) {
      return null;
    }
    return reverb.current;
  }, [enabled]);

  return {
    getPedalNode,
    node: reverb.current
  };
};

