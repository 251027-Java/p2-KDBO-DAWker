package com.project.dawker.repository;

import com.project.dawker.entity.Preset;
import java.util.ArrayList;
import com.project.dawker.entity.PresetCategory;
import com.project.dawker.entity.User;
import com.project.dawker.entity.Category;
import com.project.dawker.entity.CategoryType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;


import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class PresetRepositoryTest {
    
    @Autowired
    private PresetRepository presetRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private PresetCategoryRepository presetCategoryRepository;

    private User testUser;
    private User savedUser;
    private Preset testPreset;
    private Preset savedPreset;
    private Category testCategory;
    private Category savedCategory;
    private PresetCategory testPresetCategory;
    private PresetCategory savedPresetCategory;

    @BeforeEach
    void setUp() {
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
        testPreset.setPresetCategories(new ArrayList<>());
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

        savedPreset.addPresetCategory(savedPresetCategory);
    }

    @Test
    void findByUserId_ReturnsListOfPresets() {
        var presets = presetRepository.findByUserId(savedUser.getId());
        assertThat(presets).hasSize(1);
        assertThat(presets.get(0).getPresetName()).isEqualTo("Test Preset");
    }

    @Test
    void findByUserIdAndPresetName_ReturnsPreset() {
        var presetOpt = presetRepository.findByUserIdAndPresetName(savedUser.getId(), "Test Preset");
        assertThat(presetOpt).isPresent();
        assertThat(presetOpt.get().getPresetName()).isEqualTo("Test Preset");
    }

    @Test
    void findByCategoryId_ReturnsListOfPresets() {
        var presets = presetRepository.findByCategoryId(savedCategory.getId());
        assertThat(presets).hasSize(1);
        assertThat(presets.get(0).getPresetName()).isEqualTo("Test Preset");
    }

    @Test
    void findByUserIdAndCategoryId_ReturnsListOfPresets() {
        var presets = presetRepository.findByUserIdAndCategoryId(savedUser.getId(), savedCategory.getId());
        assertThat(presets).hasSize(1);
        assertThat(presets.get(0).getPresetName()).isEqualTo("Test Preset");
    }
}
