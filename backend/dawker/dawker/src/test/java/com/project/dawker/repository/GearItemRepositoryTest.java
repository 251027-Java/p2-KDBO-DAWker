package com.project.dawker.repository;

import com.project.dawker.entity.GearItem;
import com.project.dawker.entity.GearType;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class GearItemRepositoryTest {
    
    @Autowired
    private GearItemRepository gearItemRepository;

    private GearItem testGearItem;

    @BeforeEach
    void setUp() {
        gearItemRepository.deleteAll();
        testGearItem = new GearItem();
        testGearItem.setModelName("Test Model");
        testGearItem.setGearType(GearType.AMP);
    }

    @Test
    void findByGearType_ReturnTrue() {
        List<GearItem> retrievedGearItems = gearItemRepository.findByGearType(GearType.AMP);
        assertThat(retrievedGearItems).isNotEmpty();
        assertThat(retrievedGearItems.get(0).getModelName()).isEqualTo("Test Model");
    }

    @Test
    void findByModelName_ReturnTrue() {
        Optional<GearItem> retrievedGearItem = gearItemRepository.findByModelName("Test Model");
        assertThat(retrievedGearItem).isPresent();
        assertThat(retrievedGearItem.get().getGearType()).isEqualTo(GearType.AMP);
    }

    @Test
    void existsByModelName_ReturnTrue() {
        assertThat(gearItemRepository.existsByModelName("Test Model")).isTrue();
        assertThat(gearItemRepository.existsByModelName("Nonexistent Model")).isFalse();
    }
}