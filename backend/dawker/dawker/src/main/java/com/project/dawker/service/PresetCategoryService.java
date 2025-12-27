package com.project.dawker.service;

import com.project.dawker.controller.dto.PresetCategory.PresetCategoryDTO;
import com.project.dawker.entity.PresetCategory;
import com.project.dawker.exception.PresetCategoryNotFoundException;
import com.project.dawker.repository.PresetCategoryRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class PresetCategoryService {
    private final PresetCategoryRepository repo;

    public PresetCategoryService(PresetCategoryRepository presetCategoryRepository){
        repo = presetCategoryRepository;
    }

    public PresetCategoryDTO findById(Long id){
        return presetCategoryToRespDTO(repo.findById(id).orElseThrow(() -> new PresetCategoryNotFoundException(
            String.format("Preset Category ID = %d not found.", id))));
    }

    public List<PresetCategoryDTO> findByPresetId(Long presetId){
        return repo.findByPresetId(presetId).stream().map(this::presetCategoryToRespDTO).toList();
    }
    public List<PresetCategoryDTO> findByCategoryId(Long categoryId){
        return repo.findByCategoryId(categoryId).stream().map(this::presetCategoryToRespDTO).toList();
    }

    public boolean existsByPresetIdAndCategoryId(Long presetId, Long categoryId){
        return repo.existsByPresetIdAndCategoryId(presetId, categoryId);
    }

    public void deleteByPresetId(Long presetId){
        repo.deleteByPresetId(presetId);
    }

    private PresetCategoryDTO presetCategoryToRespDTO(PresetCategory presetCategory){
        return new PresetCategoryDTO(presetCategory.getId(), presetCategory.getPreset().getId(),
            presetCategory.getCategory().getId());
    }
}
