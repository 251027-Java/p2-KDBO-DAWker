package com.project.dawker.service;

import com.project.dawker.controller.dto.PresetCategory.PresetCategoryDTO;
import com.project.dawker.controller.dto.PresetCategory.PresetCategoryWOIDDTO;
import com.project.dawker.entity.Category;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.PresetCategory;
import com.project.dawker.exception.CategoryNotFoundException;
import com.project.dawker.exception.PresetCategoryNotFoundException;
import com.project.dawker.exception.PresetNotFoundException;
import com.project.dawker.repository.CategoryRepository;
import com.project.dawker.repository.PresetCategoryRepository;
import com.project.dawker.repository.PresetRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class PresetCategoryService {
    private final PresetCategoryRepository repo;
    private final PresetRepository pRepo;
    private final CategoryRepository cRepo;

    public PresetCategoryService(PresetCategoryRepository presetCategoryRepository, PresetRepository presetRepository, CategoryRepository categoryRepository){
        repo = presetCategoryRepository;
        pRepo = presetRepository;
        cRepo = categoryRepository;
    }

    public PresetCategoryDTO findById(Long id){
        return presetCategoryToDTO(repo.findById(id).orElseThrow(() -> new PresetCategoryNotFoundException(
            String.format("Preset Category ID = %d not found.", id))));
    }

    public List<PresetCategoryDTO> findByPresetId(Long presetId){
        return repo.findByPresetId(presetId).stream().map(this::presetCategoryToDTO).toList();
    }
    public List<PresetCategoryDTO> findByCategoryId(Long categoryId){
        return repo.findByCategoryId(categoryId).stream().map(this::presetCategoryToDTO).toList();
    }

    public boolean existsByPresetIdAndCategoryId(Long presetId, Long categoryId){
        return repo.existsByPresetIdAndCategoryId(presetId, categoryId);
    }

    public void deleteByPresetId(Long presetId){
        repo.deleteByPresetId(presetId);
    }

    public PresetCategoryDTO createPresetCategory(PresetCategoryWOIDDTO dto) {
        Preset preset = pRepo.findById(dto.presetId()).orElseThrow(() -> new PresetNotFoundException("Preset ID = " + dto.presetId() + " not found"));

        Category category = cRepo.findById(dto.categoryId()).orElseThrow(() -> new CategoryNotFoundException("Category ID = " + dto.categoryId() + " not found"));

        PresetCategory pc = new PresetCategory();
        pc.setPreset(preset);
        pc.setCategory(category);

        return presetCategoryToDTO(pc);
    }


    // currently does nothing, but keeping it here if we give PresetCategory update functionality later
    public PresetCategoryDTO updatePresetCategory(Long id, PresetCategoryWOIDDTO dto) {
        PresetCategory pc = repo.findById(id).orElseThrow(() -> new PresetCategoryNotFoundException(
            String.format("Preset Category ID = %d not found.", id)));
        return presetCategoryToDTO(pc);
    }

    public void deletePresetCategory(Long id) {
        PresetCategory pc = repo.findById(id).orElseThrow(() -> new PresetCategoryNotFoundException(
            String.format("Preset Category ID = %d not found.", id)));
        pc.getPreset().removePresetCategory(pc);
        pc.getCategory().removePresetCategory(pc);
    }

    private PresetCategoryDTO presetCategoryToDTO(PresetCategory presetCategory){
        return new PresetCategoryDTO(presetCategory.getId(), presetCategory.getPreset().getId(),
            presetCategory.getCategory().getId());
    }
}
