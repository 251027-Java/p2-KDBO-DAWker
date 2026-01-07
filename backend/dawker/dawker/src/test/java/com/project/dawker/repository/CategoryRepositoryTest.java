package com.project.dawker.repository;

import com.project.dawker.entity.Category;
import com.project.dawker.entity.CategoryType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class CategoryRepositoryTest {

    @Autowired
    private CategoryRepository categoryRepository;

    private Category testCategory;
    private Category savedCategory;

    @BeforeEach
    void setUp() {
        categoryRepository.deleteAll();
        testCategory = new Category();
        testCategory.setCategoryType(CategoryType.POP);
        savedCategory = categoryRepository.save(testCategory);
    }

    @Test
    void findByCategoryType_ReturnTrue() {
        Optional<Category> retrievedCategory = categoryRepository.findById(savedCategory.getId());
        assertThat(retrievedCategory).isPresent();
        assertThat(retrievedCategory.get().getCategoryType()).isEqualTo(CategoryType.POP);
    }

    @Test
    void existsByCategoryType_ReturnTrue() {
        assertThat(categoryRepository.existsByCategoryType(CategoryType.POP)).isTrue();
        assertThat(categoryRepository.existsByCategoryType(CategoryType.ROCK)).isFalse();
    }

}