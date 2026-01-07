package com.project.dawker.service;

import com.project.dawker.controller.dto.Preset.PresetDTO;
import com.project.dawker.controller.dto.Preset.PresetWOIDDTO;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.PresetCategory;
import com.project.dawker.entity.PresetGear;
import com.project.dawker.entity.User;
import com.project.dawker.exception.PresetNotFoundException;
import com.project.dawker.exception.UserNotFoundException;
import com.project.dawker.repository.PresetRepository;
import com.project.dawker.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class PresetService {
    private final PresetRepository repo;
    private final UserRepository uRepo;

    public PresetService(PresetRepository presetRepository, UserRepository userRepository){
        repo = presetRepository;
        uRepo = userRepository;
    }

    public PresetDTO findById(Long id){
        return presetToDTO(repo.findById(id).orElseThrow(() -> new PresetNotFoundException(
            String.format("Preset ID = %d not found.", id))));
    }

    public List<PresetDTO> findByUserId(Long userId){
        return repo.findByUserId(userId).stream().map(this::presetToDTO).toList();
    }

    public PresetDTO findByUserIdAndPresetName(Long userId, String presetName){
        return presetToDTO(repo.findByUserIdAndPresetName(userId, presetName).orElseThrow(() -> new PresetNotFoundException(
            String.format("User ID = %d, Preset = %s not found.", userId, presetName))));
    }

    public List<PresetDTO> findByCategoryId(Long categoryId){
        return repo.findByCategoryId(categoryId).stream().map(this::presetToDTO).toList();
    }

    public List<PresetDTO> findByUserIdAndCategoryId(Long userId, Long categoryId){
        return repo.findByUserIdAndCategoryId(userId, categoryId).stream().map(this::presetToDTO).toList();
    }

    public PresetDTO createPreset(PresetWOIDDTO dto) {
        Long userId = dto.userId();
        User user = uRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(
            String.format("User ID = %d not found.", userId)));

        Preset preset = new Preset();
        preset.setPresetName(dto.presetName());
        user.addPreset(preset);

        return presetToDTO(repo.save(preset));
    }

    public PresetDTO updatePreset(Long id, PresetWOIDDTO dto) {
        Preset preset = repo.findById(id).orElseThrow(() -> new PresetNotFoundException(
            String.format("Preset ID = %d not found.", id)));
        preset.setPresetName(dto.presetName());
        return presetToDTO(preset);
    }

    public void deletePreset(Long id) {
        Preset preset = repo.findById(id).orElseThrow(() -> new PresetNotFoundException(
            String.format("Preset ID = %d not found.", id)));
        preset.getUser().removePreset(preset);
    }

    private PresetDTO presetToDTO(Preset preset) {
        return new PresetDTO(preset.getId(), preset.getUser().getId(), preset.getPresetName(),
            preset.getPresetGears() == null ?
            List.of() : preset.getPresetGears().stream().map(PresetGear::getId).toList(),
            preset.getPresetCategories() == null ?
            List.of() : preset.getPresetCategories().stream().map(PresetCategory::getId).toList()
        );
    }

}
