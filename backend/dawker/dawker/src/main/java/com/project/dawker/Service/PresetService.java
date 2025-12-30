package com.project.dawker.Service;

import com.project.dawker.dto.PresetDTO;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.PresetAmp;
import com.project.dawker.entity.PresetCabinet;
import com.project.dawker.entity.PresetPedal;
import com.project.dawker.entity.User;
import com.project.dawker.repository.PresetRepository;
import com.project.dawker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PresetService {

    private final PresetRepository presetRepository;
    private final UserRepository userRepository;

    public PresetService(PresetRepository presetRepository, UserRepository userRepository) {
        this.presetRepository = presetRepository;
        this.userRepository = userRepository;
    }

    /**
     * Save a preset with all its configurations
     * @param presetDTO The preset data from the frontend
     * @param userId The user ID who owns this preset
     * @return The saved preset as a DTO
     */
    @Transactional
    public PresetDTO savePreset(PresetDTO presetDTO, Long userId) {
        // Get the user
        User user = userRepository.findById(userId != null ? userId : 1L)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Create the Preset entity
        Preset preset = new Preset();
        preset.setUser(user);
        preset.setPresetName(presetDTO.getPresetName());
        preset.setCreatedAt(LocalDateTime.now());

        // Create and link PresetPedal
        if (presetDTO.getPedal() != null) {
            PresetPedal presetPedal = new PresetPedal();
            presetPedal.setPreset(preset);
            presetPedal.setEnabled(presetDTO.getPedal().getEnabled());
            presetPedal.setReverbMix(presetDTO.getPedal().getReverbMix());
            presetPedal.setReverbRoomSize(presetDTO.getPedal().getReverbRoomSize());
            preset.setPresetPedal(presetPedal);
        }

        // Create and link PresetAmp
        if (presetDTO.getAmp() != null) {
            PresetAmp presetAmp = new PresetAmp();
            presetAmp.setPreset(preset);
            presetAmp.setDistortionValue(presetDTO.getAmp().getDistortionValue());
            presetAmp.setBassValue(presetDTO.getAmp().getBassValue());
            presetAmp.setMidValue(presetDTO.getAmp().getMidValue());
            presetAmp.setTrebleValue(presetDTO.getAmp().getTrebleValue());
            presetAmp.setReverbValue(presetDTO.getAmp().getReverbValue());
            presetAmp.setVolumeValue(presetDTO.getAmp().getVolumeValue());
            preset.setPresetAmp(presetAmp);
        }

        // Create and link PresetCabinet
        if (presetDTO.getCabinet() != null) {
            PresetCabinet presetCabinet = new PresetCabinet();
            presetCabinet.setPreset(preset);
            presetCabinet.setEnabled(presetDTO.getCabinet().getEnabled());
            presetCabinet.setCabinetLowCut(presetDTO.getCabinet().getCabinetLowCut());
            presetCabinet.setCabinetHighCut(presetDTO.getCabinet().getCabinetHighCut());
            presetCabinet.setCabinetPresence(presetDTO.getCabinet().getCabinetPresence());
            preset.setPresetCabinet(presetCabinet);
        }

        // Save the preset (cascade will save the related entities)
        Preset savedPreset = presetRepository.save(preset);

        // Convert back to DTO for response
        return mapToDTO(savedPreset);
    }

    /**
     * Get a preset by ID
     * @param presetId The preset ID
     * @return The preset as a DTO
     */
    public PresetDTO getPresetById(Long presetId) {
        Preset preset = presetRepository.findById(presetId != null ? presetId : 0L)
                .orElseThrow(() -> new RuntimeException("Preset not found with ID: " + presetId));
        return mapToDTO(preset);
    }

    /**
     * Map Preset entity to PresetDTO
     */
    private PresetDTO mapToDTO(Preset preset) {
        PresetDTO dto = new PresetDTO();
        dto.setId(preset.getId());
        dto.setPresetName(preset.getPresetName());

        // Map PresetPedal
        if (preset.getPresetPedal() != null) {
            PresetPedal pedal = preset.getPresetPedal();
            dto.setPedal(new PresetDTO.PedalDTO(
                    pedal.getEnabled(),
                    pedal.getReverbMix(),
                    pedal.getReverbRoomSize()
            ));
        }

        // Map PresetAmp
        if (preset.getPresetAmp() != null) {
            PresetAmp amp = preset.getPresetAmp();
            dto.setAmp(new PresetDTO.AmpDTO(
                    amp.getDistortionValue(),
                    amp.getBassValue(),
                    amp.getMidValue(),
                    amp.getTrebleValue(),
                    amp.getReverbValue(),
                    amp.getVolumeValue()
            ));
        }

        // Map PresetCabinet
        if (preset.getPresetCabinet() != null) {
            PresetCabinet cabinet = preset.getPresetCabinet();
            dto.setCabinet(new PresetDTO.CabinetDTO(
                    cabinet.getEnabled(),
                    cabinet.getCabinetLowCut(),
                    cabinet.getCabinetHighCut(),
                    cabinet.getCabinetPresence()
            ));
        }

        return dto;
    }
}

