package com.project.dawker.controller;

import com.project.dawker.Service.PresetService;
import com.project.dawker.dto.PresetDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// this is a minimal implementation just for testing
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // allow all origins for testing
public class TestController {

    private final PresetService presetService;

    public TestController(PresetService presetService) {
        this.presetService = presetService;
    }

    // simple GET endpoint that returns a hardcoded preset
    // frontend can call this to test the connection
    @GetMapping("/test/preset")
    public ResponseEntity<PresetDTO> getTestPreset() {
        // create a hardcoded preset matching frontend structure
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
        
        PresetDTO preset = new PresetDTO();
        preset.setId(1L);
        preset.setPresetName("Test Preset");
        preset.setUserId(1L);
        preset.setPedal(pedal);
        preset.setAmp(amp);
        preset.setCabinet(cabinet);
        
        return ResponseEntity.ok(preset);
    }
    
    // simple health check endpoint
    @GetMapping("/test/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running!");
    }
    
    /**
     * post endpoint to save a preset
     * 
     * NOTE: currently uses userId from the DTO or defaults to userId=1 for testing.
     * in production, you should:
     * 1. add proper authentication (Spring Security)
     * 2. get userId from SecurityContext instead of DTO
     * 3. remove the default userId fallback
     */
    @PostMapping("/presets")
    public ResponseEntity<PresetDTO> savePreset(@RequestBody PresetDTO presetDTO) {
        // for now, use userId from DTO or default to 1 for testing
        // TODO: replace with authenticated user from SecurityContext
        Long userId = presetDTO.getUserId();
        if (userId == null) {
            userId = 1L; // default test user - remove in production
        }

        try {
            PresetDTO savedPreset = presetService.savePreset(presetDTO, userId);
            return ResponseEntity.ok(savedPreset);
        } catch (Exception e) {
            System.err.println("Error saving preset: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // get preset by id
    @GetMapping("/presets/{id}")
    public ResponseEntity<PresetDTO> getPreset(@PathVariable Long id) {
        try {
            PresetDTO preset = presetService.getPresetById(id);
            return ResponseEntity.ok(preset);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

