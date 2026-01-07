package com.project.dawker.service;

import com.project.dawker.controller.dto.Preset.PresetDTO;
import com.project.dawker.controller.dto.Preset.PresetWOIDDTO;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.PresetCategory;
import com.project.dawker.entity.PresetGear;
import com.project.dawker.entity.User;
import com.project.dawker.exception.PresetNotFoundException;
import com.project.dawker.exception.UserNotFoundException;
import com.project.dawker.repository.PresetRepository;
import com.project.dawker.repository.UserRepository;
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
class PresetServiceTest {

    @Mock
    private PresetRepository presetRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PresetService presetService;

    private User user;
    private Preset preset;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setPresets(new java.util.ArrayList<>());

        PresetGear pg1 = new PresetGear();
        pg1.setId(10L);

        PresetCategory pc1 = new PresetCategory();
        pc1.setId(20L);

        preset = new Preset(100L, user, "Metal Preset", List.of(pg1), List.of(pc1));
    }

    @Test
    void findById_success() {
        when(presetRepository.findById(100L)).thenReturn(Optional.of(preset));

        PresetDTO result = presetService.findById(100L);

        assertEquals(100L, result.id());
        assertEquals(1L, result.userId());
        assertEquals("Metal Preset", result.presetName());
        assertEquals(List.of(10L), result.presetGearIds());
        assertEquals(List.of(20L), result.presetCategoryIds());
    }

    @Test
    void findById_notFound_throwsException() {
        when(presetRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(PresetNotFoundException.class, () -> presetService.findById(999L));
    }

    @Test
    void findByUserId_success() {
        when(presetRepository.findByUserId(1L)).thenReturn(List.of(preset));

        List<PresetDTO> result = presetService.findByUserId(1L);

        assertEquals(1, result.size());
        assertEquals("Metal Preset", result.get(0).presetName());
    }

    @Test
    void findByUserIdAndPresetName_success() {
        when(presetRepository.findByUserIdAndPresetName(1L, "Metal Preset")).thenReturn(Optional.of(preset));

        PresetDTO result = presetService.findByUserIdAndPresetName(1L, "Metal Preset");

        assertEquals(100L, result.id());
    }

    @Test
    void findByUserIdAndPresetName_notFound_throwsException() {
        when(presetRepository.findByUserIdAndPresetName(1L, "Missing")).thenReturn(Optional.empty());

        assertThrows(PresetNotFoundException.class, () -> presetService.findByUserIdAndPresetName(1L, "Missing"));
    }

    @Test
    void findByCategoryId_success() {
        when(presetRepository.findByCategoryId(20L)).thenReturn(List.of(preset));

        List<PresetDTO> result = presetService.findByCategoryId(20L);

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).id());
    }

    @Test
    void findByUserIdAndCategoryId_success() {
        when(presetRepository.findByUserIdAndCategoryId(1L, 20L)).thenReturn(List.of(preset));

        List<PresetDTO> result = presetService.findByUserIdAndCategoryId(1L, 20L);

        assertEquals(1, result.size());
    }

    @Test
    void createPreset_success() {
        PresetWOIDDTO dto = new PresetWOIDDTO(1L, "New Preset", List.of(), List.of());

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(presetRepository.save(any(Preset.class))).thenAnswer(invocation -> {
            Preset p = invocation.getArgument(0);
            p.setId(200L);
            return p;
        });

        PresetDTO result = presetService.createPreset(dto);

        assertEquals("New Preset", result.presetName());
        assertEquals(1L, result.userId());
        verify(presetRepository).save(any(Preset.class));
    }

    @Test
    void createPreset_userNotFound_throwsException() {
        PresetWOIDDTO dto = new PresetWOIDDTO(99L, "New Preset", List.of(), List.of());

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> presetService.createPreset(dto));
    }

    @Test
    void updatePreset_success() {
        PresetWOIDDTO dto = new PresetWOIDDTO(1L, "Updated Name", List.of(), List.of());

        when(presetRepository.findById(100L)).thenReturn(Optional.of(preset));

        PresetDTO result = presetService.updatePreset(100L, dto);

        assertEquals("Updated Name", result.presetName());
    }

    @Test
    void updatePreset_notFound_throwsException() {
        PresetWOIDDTO dto = new PresetWOIDDTO(1L, "Updated Name", List.of(), List.of());

        when(presetRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(PresetNotFoundException.class, () -> presetService.updatePreset(999L, dto));
    }

    @Test
    void deletePreset_success() {
        when(presetRepository.findById(100L)).thenReturn(Optional.of(preset));

        presetService.deletePreset(100L);

        verify(presetRepository).findById(100L);
        assertFalse(user.getPresets().contains(preset));
    }

    @Test
    void deletePreset_notFound_throwsException() {
        when(presetRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(PresetNotFoundException.class, () -> presetService.deletePreset(999L));
    }
}
