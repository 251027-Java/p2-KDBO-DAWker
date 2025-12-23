package com.project.dawker.repository;

import com.project.dawker.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Category entity.
 * Used for managing user-defined tags for organizing presets.
 * Supports filtering presets by category in the Library/Manager view.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Find a category by its name.
     * Used for lookup and validation when tagging presets.
     *
     * @param categoryName the name of the category (e.g., "Jazz", "Metal", "Studio")
     * @return Optional containing the category if found
     */
    Optional<Category> findByCategoryName(String categoryName);

    /**
     * Check if a category exists with the given name.
     * Used to avoid duplicate categories.
     *
     * @param categoryName the category name to check
     * @return true if a category with this name exists
     */
    boolean existsByCategoryName(String categoryName);
}

