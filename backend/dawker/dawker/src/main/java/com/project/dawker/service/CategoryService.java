package com.project.dawker.service;

import com.project.dawker.controller.dto.Category.CategoryRespDTO;
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

    public CategoryService(CategoryRepository categoryRepository){
        repo = categoryRepository;
    }

    public CategoryRespDTO findById(Long id){
        return categoryToRespDTO(repo.findById(id).orElseThrow(() -> new CategoryNotFoundException(
            String.format("Category ID = %d not found.", id))));
    }

    public CategoryRespDTO findByCategoryType(String categoryType){
        CategoryType type;

        try {
            type = CategoryType.valueOf(categoryType);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new CategoryTypeNotFoundException(
                String.format("Category Type = %s not found.", categoryType));
        }

        return findByCategoryType(type);
    }
    public CategoryRespDTO findByCategoryType(CategoryType categoryType){
        return categoryToRespDTO(repo.findByCategoryType(categoryType).orElseThrow(() -> new CategoryNotFoundException(
            String.format("Category = %s not found.", categoryType))));
    }

    public boolean existsByCategoryType(String categoryType){
        return repo.existsByCategoryType(categoryType);
    }

    private CategoryRespDTO categoryToRespDTO(Category category){
        return new CategoryRespDTO(category.getId(), category.getCategoryType().toString(),
            category.getPresetCategories().stream().map(PresetCategory::getId).toList());
    }
}
