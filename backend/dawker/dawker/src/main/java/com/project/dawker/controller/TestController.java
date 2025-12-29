package com.project.dawker.controller;

import com.project.dawker.dto.PresetDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Simple test controller to verify frontend-backend connection
 * This is a minimal implementation just for testing
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*") // Allow all origins for testing
public class TestController {

    /**
     * Simple GET endpoint that returns a hardcoded preset
     * Frontend can call this to test the connection
     */
    @GetMapping("/preset")
    public ResponseEntity<PresetDTO> getTestPreset() {
        // Create a hardcoded preset matching frontend structure
        PresetDTO.PedalDTO pedal = new PresetDTO.PedalDTO(
            true,   // enabled
            0.8,    // reverbMix
            0.9     // reverbRoomSize
        );
        
        PresetDTO.AmpDTO amp = new PresetDTO.AmpDTO(
            0.4,    // distortionValue
            0.0,    // bassValue
            0.0,    // midValue
            0.0,    // trebleValue
            0.3,    // reverbValue
            -6.0    // volumeValue
        );
        
        PresetDTO.CabinetDTO cabinet = new PresetDTO.CabinetDTO(
            true,   // enabled
            80,     // cabinetLowCut
            8000,   // cabinetHighCut
            0.0     // cabinetPresence
        );
        
        PresetDTO preset = new PresetDTO(
            1L,
            "Test Preset",
            pedal,
            amp,
            cabinet
        );
        
        return ResponseEntity.ok(preset);
    }
    
    /**
     * Simple health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running!");
    }
}

