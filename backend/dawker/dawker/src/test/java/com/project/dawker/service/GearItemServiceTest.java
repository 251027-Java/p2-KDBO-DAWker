package com.project.dawker.service;

import com.project.dawker.controller.dto.GearItem.GearItemDTO;
import com.project.dawker.entity.GearItem;
import com.project.dawker.entity.GearType;
import com.project.dawker.entity.PresetGear;
import com.project.dawker.exception.GearItemNotFoundException;
import com.project.dawker.exception.GearTypeNotFoundException;
import com.project.dawker.repository.GearItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GearItemServiceTest {

    @Mock
    private GearItemRepository gearItemRepository;

    @InjectMocks
    private GearItemService gearItemService;

    private GearItem gearItem;

    @BeforeEach
    void setUp() {
        PresetGear pg1 = new PresetGear();
        pg1.setId(1L);

        PresetGear pg2 = new PresetGear();
        pg2.setId(2L);

        gearItem = new GearItem(10L, "Tube Screamer", GearType.PEDAL, List.of(pg1, pg2));
    }

    @Test
    void findById_success() {
        when(gearItemRepository.findById(10L)) .thenReturn(Optional.of(gearItem));

        GearItemDTO result = gearItemService.findById(10L);

        assertNotNull(result);
        assertEquals(10L, result.id());
        assertEquals("Tube Screamer", result.modelName());
        assertEquals("PEDAL", result.gearType());
        assertEquals(List.of(1L, 2L), result.presetGearIds());
    }

    @Test
    void findById_notFound_throwsException() {
        when(gearItemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(GearItemNotFoundException.class, () -> gearItemService.findById(99L));
    }

    @Test
    void findByGearType_string_success() {
        when(gearItemRepository.findByGearType(GearType.PEDAL)).thenReturn(List.of(gearItem));

        List<GearItemDTO> result = gearItemService.findByGearType("PEDAL");

        assertEquals(1, result.size());
        assertEquals("Tube Screamer", result.get(0).modelName());
    }

    @Test
    void findByGearType_string_invalidEnum_throwsException() {
        assertThrows(GearTypeNotFoundException.class, () -> gearItemService.findByGearType("NOT_A_TYPE"));
    }

    @Test
    void findByGearType_enum_success() {
        when(gearItemRepository.findByGearType(GearType.PEDAL)).thenReturn(List.of(gearItem));

        List<GearItemDTO> result = gearItemService.findByGearType(GearType.PEDAL);

        assertEquals(1, result.size());
        assertEquals("PEDAL", result.get(0).gearType());
    }

    @Test
    void findByModelName_success() {
        when(gearItemRepository.findByModelName("Tube Screamer")).thenReturn(Optional.of(gearItem));

        GearItemDTO result = gearItemService.findByModelName("Tube Screamer");

        assertEquals(10L, result.id());
        assertEquals("Tube Screamer", result.modelName());
    }

    @Test
    void findByModelName_notFound_throwsException() {
        when(gearItemRepository.findByModelName("Unknown")).thenReturn(Optional.empty());

        assertThrows(GearItemNotFoundException.class, () -> gearItemService.findByModelName("Unknown"));
    }

    @Test
    void existsByModelName_true() {
        when(gearItemRepository.existsByModelName("Tube Screamer")).thenReturn(true);

        boolean exists = gearItemService.existsByModelName("Tube Screamer");

        assertTrue(exists);
    }

    @Test
    void existsByModelName_false() {
        when(gearItemRepository.existsByModelName("Unknown")).thenReturn(false);

        boolean exists = gearItemService.existsByModelName("Unknown");

        assertFalse(exists);
    }
}
