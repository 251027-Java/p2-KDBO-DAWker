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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PresetCategoryServiceTest {

    @Mock
    private PresetCategoryRepository presetCategoryRepository;

    @Mock
    private PresetRepository presetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private PresetCategoryService presetCategoryService;

    private Preset preset;
    private Category category;
    private PresetCategory presetCategory;

    @BeforeEach
    void setUp() {
        preset = new Preset();
        preset.setId(1L);
        preset.setPresetCategories(new ArrayList<>());

        category = new Category();
        category.setId(2L);
        category.setPresetCategories(new ArrayList<>());

        presetCategory = new PresetCategory();
        presetCategory.setId(10L);
        presetCategory.setPreset(preset);
        presetCategory.setCategory(category);

        preset.getPresetCategories().add(presetCategory);
        category.getPresetCategories().add(presetCategory);
    }

    @Test
    void findById_success() {
        when(presetCategoryRepository.findById(10L)).thenReturn(Optional.of(presetCategory));

        PresetCategoryDTO result = presetCategoryService.findById(10L);

        assertEquals(10L, result.id());
        assertEquals(1L, result.presetId());
        assertEquals(2L, result.categoryId());
    }

    @Test
    void findById_notFound_throwsException() {
        when(presetCategoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PresetCategoryNotFoundException.class, () -> presetCategoryService.findById(99L));
    }

    @Test
    void findByPresetId_success() {
        when(presetCategoryRepository.findByPresetId(1L)).thenReturn(List.of(presetCategory));

        List<PresetCategoryDTO> result = presetCategoryService.findByPresetId(1L);

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).id());
    }

    @Test
    void findByCategoryId_success() {
        when(presetCategoryRepository.findByCategoryId(2L)).thenReturn(List.of(presetCategory));

        List<PresetCategoryDTO> result = presetCategoryService.findByCategoryId(2L);

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).id());
    }

    @Test
    void existsByPresetIdAndCategoryId_true() {
        when(presetCategoryRepository.existsByPresetIdAndCategoryId(1L, 2L)).thenReturn(true);

        assertTrue(presetCategoryService.existsByPresetIdAndCategoryId(1L, 2L));
    }

    @Test
    void deleteByPresetId_callsRepository() {
        presetCategoryService.deleteByPresetId(1L);

        verify(presetCategoryRepository).deleteByPresetId(1L);
    }

    @Test
    void createPresetCategory_success() {
        PresetCategoryWOIDDTO dto = new PresetCategoryWOIDDTO(1L, 2L);

        when(presetRepository.findById(1L)).thenReturn(Optional.of(preset));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));

        PresetCategoryDTO result = presetCategoryService.createPresetCategory(dto);

        assertEquals(1L, result.presetId());
        assertEquals(2L, result.categoryId());
        assertEquals(1, preset.getPresetCategories().size());
        assertEquals(1, category.getPresetCategories().size());
    }

    @Test
    void createPresetCategory_presetNotFound_throwsException() {
        PresetCategoryWOIDDTO dto = new PresetCategoryWOIDDTO(99L, 2L);

        when(presetRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PresetNotFoundException.class, () -> presetCategoryService.createPresetCategory(dto));
    }

    @Test
    void createPresetCategory_categoryNotFound_throwsException() {
        PresetCategoryWOIDDTO dto = new PresetCategoryWOIDDTO(1L, 99L);

        when(presetRepository.findById(1L)).thenReturn(Optional.of(preset));
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CategoryNotFoundException.class, () -> presetCategoryService.createPresetCategory(dto));
    }

    @Test
    void updatePresetCategory_success_noChanges() {
        PresetCategoryWOIDDTO dto = new PresetCategoryWOIDDTO(1L, 2L);

        when(presetCategoryRepository.findById(10L)).thenReturn(Optional.of(presetCategory));

        PresetCategoryDTO result = presetCategoryService.updatePresetCategory(10L, dto);

        assertEquals(10L, result.id());
    }

    @Test
    void updatePresetCategory_notFound_throwsException() {
        PresetCategoryWOIDDTO dto = new PresetCategoryWOIDDTO(1L, 2L);

        when(presetCategoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PresetCategoryNotFoundException.class, () -> presetCategoryService.updatePresetCategory(99L, dto));
    }

    @Test
    void deletePresetCategory_success() {
        when(presetCategoryRepository.findById(10L)).thenReturn(Optional.of(presetCategory));

        presetCategoryService.deletePresetCategory(10L);

        assertTrue(preset.getPresetCategories().isEmpty());
        assertTrue(category.getPresetCategories().isEmpty());
    }

    @Test
    void deletePresetCategory_notFound_throwsException() {
        when(presetCategoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PresetCategoryNotFoundException.class, () -> presetCategoryService.deletePresetCategory(99L));
    }
}
