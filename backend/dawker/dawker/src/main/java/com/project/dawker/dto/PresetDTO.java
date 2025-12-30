package com.project.dawker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// SAMPLE DTO FOR TESTING CONNECTION
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresetDTO {
    private Long id;
    private String presetName;
    private Long userId; // Optional: for creating presets, can be set from frontend or backend
    
    // pedal settings
    private PedalDTO pedal;
    
    // amp settings
    private AmpDTO amp;
    
    // cabinet settings
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

