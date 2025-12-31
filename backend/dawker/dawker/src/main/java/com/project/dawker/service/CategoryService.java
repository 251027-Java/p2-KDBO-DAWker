package com.project.dawker.service;

import com.project.dawker.controller.dto.Category.CategoryDTO;
import com.project.dawker.entity.Category;
import com.project.dawker.entity.CategoryType;
import com.project.dawker.entity.PresetCategory;
import com.project.dawker.exception.CategoryNotFoundException;
import com.project.dawker.exception.CategoryTypeNotFoundException;
import com.project.dawker.repository.CategoryRepository;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {
    private final CategoryRepository repo;

    public CategoryService(CategoryRepository categoryRepository) {
        repo = categoryRepository;
    }

    public CategoryDTO findById(Long id) {
        return categoryToDTO(repo.findById(id).orElseThrow(() -> new CategoryNotFoundException(
                String.format("Category ID = %d not found.", id))));
    }

    public CategoryDTO findByCategoryType(String categoryType) {
        CategoryType type;

        try {
            type = CategoryType.valueOf(categoryType);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new CategoryTypeNotFoundException(
                    String.format("Category Type = %s not found.", categoryType));
        }

        return findByCategoryType(type);
    }

    public CategoryDTO findByCategoryType(CategoryType categoryType) {
        return categoryToDTO(repo.findByCategoryType(categoryType).orElseThrow(() -> new CategoryNotFoundException(
                String.format("Category = %s not found.", categoryType))));
    }

    public boolean existsByCategoryType(String categoryType) {
        return repo.existsByCategoryType(categoryType);
    }

    private CategoryDTO categoryToDTO(Category category) {
        return new CategoryDTO(category.getId(), category.getCategoryType().toString(),
                category.getPresetCategories().stream().map(PresetCategory::getId).toList());
    }
}
