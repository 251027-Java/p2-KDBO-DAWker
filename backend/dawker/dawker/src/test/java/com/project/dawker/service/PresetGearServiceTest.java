package com.project.dawker.service;

import com.project.dawker.controller.dto.PresetGear.PresetGearDTO;
import com.project.dawker.controller.dto.PresetGear.PresetGearWOIDDTO;
import com.project.dawker.entity.GearItem;
import com.project.dawker.entity.GearType;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.PresetGear;
import com.project.dawker.exception.*;
import com.project.dawker.repository.GearItemRepository;
import com.project.dawker.repository.PresetGearRepository;
import com.project.dawker.repository.PresetRepository;
import com.project.dawker.repository.dto.GearItemUsageDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PresetGearServiceTest {

    @Mock
    private PresetGearRepository presetGearRepository;

    @Mock
    private PresetRepository presetRepository;

    @Mock
    private GearItemRepository gearItemRepository;

    @InjectMocks
    private PresetGearService presetGearService;

    private Preset preset;
    private GearItem gearItem;
    private PresetGear presetGear;

    @BeforeEach
    void setUp() {
        preset = new Preset();
        preset.setId(1L);
        preset.setPresetGears(new ArrayList<>());

        gearItem = new GearItem();
        gearItem.setId(2L);
        gearItem.setGearType(GearType.PEDAL);
        gearItem.setPresetGears(new ArrayList<>());

        presetGear = new PresetGear();
        presetGear.setId(10L);
        presetGear.setPreset(preset);
        presetGear.setGearItem(gearItem);
        presetGear.setGainValue(0.5);
        presetGear.setToneValue(0.7);
        presetGear.setOrderIndex(1);

        preset.getPresetGears().add(presetGear);
        gearItem.getPresetGears().add(presetGear);
    }

    @Test
    void findById_success() {
        when(presetGearRepository.findById(10L)).thenReturn(Optional.of(presetGear));

        PresetGearDTO dto = presetGearService.findById(10L);

        assertEquals(10L, dto.id());
        assertEquals(1L, dto.presetId());
        assertEquals(2L, dto.gearItemId());
    }

    @Test
    void findById_notFound_throwsException() {
        when(presetGearRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PresetGearNotFoundException.class, () -> presetGearService.findById(99L));
    }

    @Test
    void findByPresetIdOrderByOrderIndexAsc_success() {
        when(presetGearRepository.findByPresetIdOrderByOrderIndexAsc(1L)).thenReturn(List.of(presetGear));

        List<PresetGearDTO> result = presetGearService.findByPresetIdOrderByOrderIndexAsc(1L);

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).orderIndex());
    }

    @Test
    void findByGearItemId_success() {
        when(presetGearRepository.findByGearItemId(2L)).thenReturn(List.of(presetGear));

        List<PresetGearDTO> result = presetGearService.findByGearItemId(2L);

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).id());
    }

    @Test
    void countByGearItemId_success() {
        when(presetGearRepository.countByGearItemId(2L)).thenReturn(3L);

        assertEquals(3L, presetGearService.countByGearItemId(2L));
    }

    @Test
    void findMostPopularGearItems_default_success() {
        GearItemUsageDTO usage = new GearItemUsageDTO(2L, 5L);

        when(presetGearRepository.findMostPopularGearItems(any(Pageable.class))).thenReturn(List.of(usage));

        Map<Long, Long> result = presetGearService.findMostPopularGearItems();

        assertEquals(1, result.size());
        assertEquals(5L, result.get(2L));
    }

    @Test
    void findMostPopularGearItems_nonPositive_throwsException() {
        assertThrows(NonPositiveNumberException.class, () -> presetGearService.findMostPopularGearItems(0));
    }

    @Test
    void findByGearType_string_success() {
        when(presetGearRepository.findByGearType(GearType.PEDAL)).thenReturn(List.of(presetGear));

        List<PresetGearDTO> result = presetGearService.findByGearType("PEDAL");

        assertEquals(1, result.size());
    }

    @Test
    void findByGearType_string_invalid_throwsException() {
        assertThrows(CategoryTypeNotFoundException.class, () -> presetGearService.findByGearType("INVALID"));
    }

    @Test
    void findByGearType_enum_success() {
        when(presetGearRepository.findByGearType(GearType.PEDAL)).thenReturn(List.of(presetGear));

        List<PresetGearDTO> result = presetGearService.findByGearType(GearType.PEDAL);

        assertEquals(1, result.size());
    }

    @Test
    void createPresetGear_success() {
        PresetGearWOIDDTO dto = new PresetGearWOIDDTO(1L, 2L, 0.3, 0.6, 2);

        when(presetRepository.findById(1L)).thenReturn(Optional.of(preset));
        when(gearItemRepository.findById(2L)).thenReturn(Optional.of(gearItem));

        PresetGearDTO result = presetGearService.createPresetGear(dto);

        assertEquals(1L, result.presetId());
        assertEquals(2L, result.gearItemId());
        assertEquals(2, preset.getPresetGears().size());
        assertEquals(2, gearItem.getPresetGears().size());
    }

    @Test
    void createPresetGear_presetNotFound_throwsException() {
        PresetGearWOIDDTO dto = new PresetGearWOIDDTO(99L, 2L, 0.3, 0.6, 1);

        when(presetRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PresetNotFoundException.class, () -> presetGearService.createPresetGear(dto));
    }

    @Test
    void createPresetGear_gearItemNotFound_throwsException() {
        PresetGearWOIDDTO dto = new PresetGearWOIDDTO(1L, 99L, 0.3, 0.6, 1);

        when(presetRepository.findById(1L)).thenReturn(Optional.of(preset));
        when(gearItemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(GearItemNotFoundException.class, () -> presetGearService.createPresetGear(dto));
    }

    @Test
    void updatePresetGear_success() {
        PresetGearWOIDDTO dto = new PresetGearWOIDDTO(1L, 2L, 0.9, 0.8, 3);

        when(presetGearRepository.findById(10L)).thenReturn(Optional.of(presetGear));

        PresetGearDTO result = presetGearService.updatePresetGear(10L, dto);

        assertEquals(0.9, result.gainValue());
        assertEquals(0.8, result.toneValue());
        assertEquals(3, result.orderIndex());
    }

    @Test
    void updatePresetGear_notFound_throwsException() {
        PresetGearWOIDDTO dto = new PresetGearWOIDDTO(1L, 2L, 0.9, 0.8, 3);

        when(presetGearRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PresetGearNotFoundException.class, () -> presetGearService.updatePresetGear(99L, dto));
    }

    @Test
    void deletePresetGear_success() {
        when(presetGearRepository.findById(10L)).thenReturn(Optional.of(presetGear));

        presetGearService.deletePresetGear(10L);

        assertTrue(preset.getPresetGears().isEmpty());
        assertTrue(gearItem.getPresetGears().isEmpty());
    }

    @Test
    void deletePresetGear_notFound_throwsException() {
        when(presetGearRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PresetGearNotFoundException.class, () -> presetGearService.deletePresetGear(99L));
    }
}
