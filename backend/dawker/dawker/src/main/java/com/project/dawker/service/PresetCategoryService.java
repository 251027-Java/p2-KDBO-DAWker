package com.project.dawker.service;

import com.project.dawker.controller.dto.PresetCategory.PresetCategoryRespDTO;
import com.project.dawker.entity.PresetCategory;
import com.project.dawker.repository.PresetCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PresetCategoryService {
    private final PresetCategoryRepository repo;

    public PresetCategoryService(PresetCategoryRepository presetCategoryRepository){
        repo = presetCategoryRepository;
    }

    public List<PresetCategoryRespDTO> findByPresetId(Long presetId){
        return repo.findByPresetId(presetId).stream().map(this::presetCategoryToRespDTO).toList();
    }
    public List<PresetCategoryRespDTO> findByCategoryId(Long categoryId){
        return repo.findByCategoryId(categoryId).stream().map(this::presetCategoryToRespDTO).toList();
    }

    public boolean existsByPresetIdAndCategoryId(Long presetId, Long categoryId){
        return repo.existsByPresetIdAndCategoryId(presetId, categoryId);
    }

    public void deleteByPresetId(Long presetId){
        repo.deleteByPresetId(presetId);
    }

    private PresetCategoryRespDTO presetCategoryToRespDTO(PresetCategory presetCategory){
        return new PresetCategoryRespDTO(presetCategory.getId(), presetCategory.getPreset().getId(),
            presetCategory.getCategory().getId());
    }
}
