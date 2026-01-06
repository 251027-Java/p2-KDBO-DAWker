package com.project.dawker.repository;

import com.project.dawker.entity.Category;
import com.project.dawker.entity.CategoryType;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.PresetCategory;
import com.project.dawker.entity.User;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class PresetCategoryRepositoryTest {
    
    @Autowired
    private PresetCategoryRepository presetCategoryRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private PresetRepository presetRepository;
    @Autowired
    private UserRepository userRepository;

    private PresetCategory testPresetCategory;
    private PresetCategory savedPresetCategory;
    private Preset testPreset;
    private Preset savedPreset;
    private Category testCategory;
    private Category savedCategory;
    private User testUser;
    private User savedUser;
    

    @BeforeEach
    void setUp() {
        presetCategoryRepository.deleteAll();
        categoryRepository.deleteAll();
        presetRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setUsername("john_doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("securepassword");
        testUser.setRole("USER");
        savedUser = userRepository.save(testUser);

        testPreset = new Preset();
        testPreset.setPresetName("Test Preset");
        testPreset.setUser(savedUser);
        savedPreset = presetRepository.save(testPreset);

        testCategory = new Category();
        testCategory.setCategoryType(CategoryType.ROCK);
        savedCategory = categoryRepository.save(testCategory);

        testPresetCategory = new PresetCategory();
        testPresetCategory.setPreset(savedPreset);
        testPresetCategory.setCategory(savedCategory);
        savedPresetCategory = presetCategoryRepository.save(testPresetCategory);
    }

    @Test
    void findByPresetId_ReturnsPresetCategories() {
        Long presetId = savedPresetCategory.getPreset().getId();
        Optional<PresetCategory> retrievedPresetCategory = presetCategoryRepository.findById(savedPresetCategory.getId());
        assertThat(retrievedPresetCategory).isPresent();
        assertThat(retrievedPresetCategory.get().getPreset().getId()).isEqualTo(presetId);
    }

    @Test
    void findByCategoryId_ReturnsPresetCategories() {
        Long categoryId = savedCategory.getId();
        testPresetCategory.setCategory(savedCategory);
        presetCategoryRepository.save(testPresetCategory);

        var retrievedPresetCategories = presetCategoryRepository.findByCategoryId(categoryId);
        assertThat(retrievedPresetCategories).isNotEmpty();
        assertThat(retrievedPresetCategories.get(0).getCategory().getId()).isEqualTo(categoryId);
    }

    @Test
    void existsByPresetIdAndCategoryId_ReturnsTrue() {
        testPresetCategory.setCategory(savedCategory);
        PresetCategory savedPC = presetCategoryRepository.save(testPresetCategory);

        Long presetId = savedPC.getPreset().getId();
        Long categoryId = savedPC.getCategory().getId();

        boolean exists = presetCategoryRepository.existsByPresetIdAndCategoryId(presetId, categoryId);
        assertThat(exists).isTrue();
    }

    @Test
    void deleteByPresetId_RemovesPresetCategories() {
        Long presetId = savedPresetCategory.getPreset().getId();
        presetCategoryRepository.deleteByPresetId(presetId);

        var retrievedPresetCategories = presetCategoryRepository.findByPresetId(presetId);
        assertThat(retrievedPresetCategories).isEmpty();
    }
}
