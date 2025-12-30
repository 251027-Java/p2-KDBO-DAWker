package com.project.dawker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Simple DTO matching frontend structure for testing connection
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresetDTO {
    private Long id;
    private String presetName;
    
    // Pedal settings
    private PedalDTO pedal;
    
    // Amp settings
    private AmpDTO amp;
    
    // Cabinet settings
    private CabinetDTO cabinet;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PedalDTO {
        private Boolean enabled;
        private Double reverbMix;
        private Double reverbRoomSize;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AmpDTO {
        private Double distortionValue;
        private Double bassValue;
        private Double midValue;
        private Double trebleValue;
        private Double reverbValue;
        private Double volumeValue;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CabinetDTO {
        private Boolean enabled;
        private Integer cabinetLowCut;
        private Integer cabinetHighCut;
        private Double cabinetPresence;
    }
}

