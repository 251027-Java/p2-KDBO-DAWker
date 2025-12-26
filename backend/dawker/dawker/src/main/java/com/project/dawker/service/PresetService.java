package com.project.dawker.service;

import com.project.dawker.controller.dto.Preset.PresetRespDTO;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.PresetCategory;
import com.project.dawker.entity.PresetGear;
import com.project.dawker.exception.PresetNotFoundException;
import com.project.dawker.repository.PresetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PresetService {
    private final PresetRepository repo;

    public PresetService(PresetRepository presetRepository){
        repo = presetRepository;
    }

    public List<PresetRespDTO> findByUserId(Long userId){
        return repo.findByUserId(userId).stream().map(this::presetToRespDTO).toList();
    }

    public PresetRespDTO findByUserIdAndPresetName(Long userId, String presetName){
        return presetToRespDTO(repo.findByUserIdAndPresetName(userId, presetName).orElseThrow(() -> new PresetNotFoundException(
            String.format("User ID = %d, Preset = %s not found.", userId, presetName))));
    }

    public List<PresetRespDTO> findByCategoryId(Long categoryId){
        return repo.findByCategoryId(categoryId).stream().map(this::presetToRespDTO).toList();
    }

    public List<PresetRespDTO> findByUserIdAndCategoryId(Long userId, Long categoryId){
        return repo.findByUserIdAndCategoryId(userId, categoryId).stream().map(this::presetToRespDTO).toList();
    }

    private PresetRespDTO presetToRespDTO(Preset preset){
        return new PresetRespDTO(preset.getId(), preset.getUser().getId(), preset.getPresetName(),
            preset.getPresetGears().stream().map(PresetGear::getId).toList(),
            preset.getPresetCategories().stream().map(PresetCategory::getId).toList());
    }
}
