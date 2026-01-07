package com.project.dawker.service;

import com.project.dawker.controller.dto.Category.CategoryDTO;
import com.project.dawker.entity.Category;
import com.project.dawker.entity.CategoryType;
import com.project.dawker.entity.PresetCategory;
import com.project.dawker.exception.CategoryNotFoundException;
import com.project.dawker.exception.CategoryTypeNotFoundException;
import com.project.dawker.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category category;

    @BeforeEach
    void setUp() {
        PresetCategory pc1 = new PresetCategory();
        pc1.setId(1L);
        PresetCategory pc2 = new PresetCategory();
        pc2.setId(2L);
        category = new Category(10L, CategoryType.POP, List.of(pc1, pc2)
        );
    }

    @Test
    void findById_success() {
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        CategoryDTO result = categoryService.findById(10L);
        assertNotNull(result);
        assertEquals(10L, result.id());
        assertEquals("POP", result.categoryType());
        assertEquals(List.of(1L, 2L), result.presetCategoryIds());
    }

    @Test
    void findById_notFound_throwsException() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(CategoryNotFoundException.class,() -> categoryService.findById(99L));
    }

    @Test
    void findByCategoryType_string_success() {
        when(categoryRepository.findByCategoryType(CategoryType.POP)).thenReturn(Optional.of(category));
        CategoryDTO result = categoryService.findByCategoryType("POP");
        assertEquals("POP", result.categoryType());
    }

    @Test
    void findByCategoryType_string_invalidEnum_throwsException() {
        assertThrows(CategoryTypeNotFoundException.class,() -> categoryService.findByCategoryType("INVALID_TYPE"));
    }

    @Test
    void findByCategoryType_string_notFound_throwsException() {
        when(categoryRepository.findByCategoryType(CategoryType.POP)).thenReturn(Optional.empty());
        assertThrows(CategoryNotFoundException.class,() -> categoryService.findByCategoryType("POP"));
    }

    @Test
    void findByCategoryType_enum_success() {
        when(categoryRepository.findByCategoryType(CategoryType.POP)).thenReturn(Optional.of(category));
        CategoryDTO result = categoryService.findByCategoryType(CategoryType.POP);
        assertEquals(10L, result.id());
    }

    @Test
    void existsByCategoryType_string_success() {
        when(categoryRepository.existsByCategoryType(CategoryType.POP)).thenReturn(true);
        boolean exists = categoryService.existsByCategoryType("POP");
        assertTrue(exists);
    }

    @Test
    void existsByCategoryType_string_invalidEnum_returnsFalse() {
        boolean exists = categoryService.existsByCategoryType("NOT_A_TYPE");
        assertFalse(exists);
        verifyNoInteractions(categoryRepository);
    }

    @Test
    void existsByCategoryType_enum_success() {
        when(categoryRepository.existsByCategoryType(CategoryType.POP)).thenReturn(true);
        boolean exists = categoryService.existsByCategoryType(CategoryType.POP);
        assertTrue(exists);
    }
}
