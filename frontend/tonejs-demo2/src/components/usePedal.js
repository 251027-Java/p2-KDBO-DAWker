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
    if (!reverb.current) {
      reverb.current = new Tone.Reverb({
        roomSize: reverbRoomSize,
        wet: reverbMix
      });
      // generate the reverb impulse response
      reverb.current.generate().catch(err => {
        console.error('Error generating reverb:', err);
      });
    }

    return () => {
      if (reverb.current) {
        reverb.current.dispose();
        reverb.current = null;
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (reverb.current && enabled) {
      reverb.current.wet.value = reverbMix;
    }
  }, [reverbMix, enabled]);

  useEffect(() => {
    if (reverb.current && enabled) {
      reverb.current.roomSize.value = reverbRoomSize;
    }
  }, [reverbRoomSize, enabled]);

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

