package com.project.dawker.repository;

import com.project.dawker.entity.PresetGear;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.User;
import com.project.dawker.entity.GearItem;
import com.project.dawker.entity.GearType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class PresetGearRepositoryTest {
    
    @Autowired
    private PresetGearRepository presetGearRepository;
    @Autowired
    private PresetRepository presetRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GearItemRepository gearItemRepository;

    private PresetGear testPresetGear;
    private PresetGear savedPresetGear;
    private Preset testPreset;
    private Preset savedPreset;
    private User testUser;
    private User savedUser;
    private GearItem testGearItem;
    private GearItem savedGearItem;
    
    @BeforeEach
    void setUp() {
        presetGearRepository.deleteAll();
        presetRepository.deleteAll();
        userRepository.deleteAll();
        gearItemRepository.deleteAll();

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

        testGearItem = new GearItem();
        testGearItem.setModelName("Test Amp");
        testGearItem.setGearType(GearType.AMP);
        savedGearItem = gearItemRepository.save(testGearItem);

        testPresetGear = new PresetGear();
        testPresetGear.setPreset(savedPreset);
        testPresetGear.setGearItem(savedGearItem);
        testPresetGear.setGainValue(5.0);
        testPresetGear.setToneValue(7.5);
        testPresetGear.setOrderIndex(1);
        savedPresetGear = presetGearRepository.save(testPresetGear);
    }

    @Test
    void findByPresetIdOrderByOrderIndexAsc_ShouldReturnPresetGearList() {
        Long presetId = savedPresetGear.getPreset().getId();
        var presetGearList = presetGearRepository.findByPresetIdOrderByOrderIndexAsc(presetId);
        assertThat(presetGearList).isNotEmpty();
        assertThat(presetGearList.get(0).getId()).isEqualTo(savedPresetGear.getId());
    }

    @Test
    void findByGearItemId_ShouldReturnPresetGearList() {
        Long gearItemId = savedPresetGear.getGearItem().getId();
        var presetGearList = presetGearRepository.findByGearItemId(gearItemId);
        assertThat(presetGearList).isNotEmpty();
        assertThat(presetGearList.get(0).getId()).isEqualTo(savedPresetGear.getId());
    }

    @Test
    void countByGearItemId_ShouldReturnCorrectCount() {
        Long gearItemId = savedPresetGear.getGearItem().getId();
        long count = presetGearRepository.countByGearItemId(gearItemId);
        assertThat(count).isEqualTo(1);
    }

    @Test
    void findMostPopularGearItems_ShouldReturnGearItemUsageDTOList() {
        var gearItemUsageList = presetGearRepository.findMostPopularGearItems(org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(gearItemUsageList).isNotEmpty();
        assertThat(gearItemUsageList.get(0).gearItemId()).isEqualTo(savedPresetGear.getGearItem().getId());
        assertThat(gearItemUsageList.get(0).usageCount()).isEqualTo(1);
    }

    @Test
    void findByGearType_ShouldReturnPresetGearList() {
        var presetGearList = presetGearRepository.findByGearType(GearType.AMP);
        assertThat(presetGearList).isNotEmpty();
        assertThat(presetGearList.get(0).getId()).isEqualTo(savedPresetGear.getId());
    }
}
