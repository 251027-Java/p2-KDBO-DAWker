package com.project.dawker.repository;

import com.project.dawker.entity.PresetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// links presets to categories, allows one preset to have multiple tags
@Repository
public interface PresetCategoryRepository extends JpaRepository<PresetCategory, Long> {

    List<PresetCategory> findByPresetId(Long presetId);
    List<PresetCategory> findByCategoryId(Long categoryId);

    // check if a specific preset-category relationship exists
    // used to prevent duplicate category assignments
    boolean existsByPresetIdAndCategoryId(Long presetId, Long categoryId);

    // delete all preset category entries for a specific preset
    // used when removing all categories from a preset
    void deleteByPresetId(Long presetId);
}

