package com.project.dawker.repository;

import com.project.dawker.entity.Preset;
import com.project.dawker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PresetRepository extends JpaRepository<Preset, Long> {

    List<Preset> findByUser(User user);

    List<Preset> findByUserId(Long userId);

    Optional<Preset> findByUserAndPresetName(User user, String presetName);

    // find all presets with a specific category. returns list of presets with that category
    @Query("SELECT p FROM Preset p JOIN p.presetCategories pc WHERE pc.category.id = :categoryId")
    List<Preset> findByCategoryId(@Param("categoryId") Long categoryId);

    // find all presets for a user that have a specific category. returns list of presets with that category (used for user specfic category filtering)
    @Query("SELECT p FROM Preset p JOIN p.presetCategories pc WHERE p.user.id = :userId AND pc.category.id = :categoryId")
    List<Preset> findByUserIdAndCategoryId(@Param("userId") Long userId, @Param("categoryId") Long categoryId);
}

