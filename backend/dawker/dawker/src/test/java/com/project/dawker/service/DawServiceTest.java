package com.project.dawker.service;

import com.project.dawker.dto.componentDTO;
import com.project.dawker.dto.configDTO;
import com.project.dawker.dto.dawDTO;
import com.project.dawker.dto.settingsDTO;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.ComponentEntity;
import com.project.dawker.entity.daw_specific.ConfigEntity;
import com.project.dawker.entity.daw_specific.DawEntity;
import com.project.dawker.entity.daw_specific.SettingsEntity;
import com.project.dawker.exceptions.dawNotFoundException;
import com.project.dawker.kafka.KafkaLogProducer;
import com.project.dawker.repository.ConfigRepository;
import com.project.dawker.repository.DawRepository;
import com.project.dawker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.project.dawker.service.DawService;

@ExtendWith(MockitoExtension.class)
class DawServiceTest {

    @Mock
    private DawRepository dawRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ConfigRepository configRepository;

    @Mock
    private KafkaLogProducer logger;

    @InjectMocks
    private DawService dawService;

    private User user;
    private DawEntity daw;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        SettingsEntity settings = new SettingsEntity();
        settings.setId(100L);
        settings.setTechnology("VST");
        settings.setExportName("AmpSim");
        settings.setParameters(Map.of("gain", 7));

        ComponentEntity component = new ComponentEntity();
        component.setId(200L);
        component.setInstanceId("comp-1");
        component.setName("Amp");
        component.setType("EFFECT");
        component.setSettings(settings);

        ConfigEntity config = new ConfigEntity();
        config.setId(300L);
        config.setName("Metal Config");
        config.setComponents(List.of(component));

        component.setConfig(config);

        daw = new DawEntity();
        daw.setId("daw-123");
        daw.setName("Metal Rig");
        daw.setDescription("High gain setup");
        daw.setCreatedAt(LocalDateTime.now());
        daw.setExportCount(5);
        daw.setUser(user);
        daw.setListOfConfigs(new ArrayList<>(List.of(config)));
    }

    @Test
    void getAllDaws_success() {
        when(dawRepository.findAll()).thenReturn(List.of(daw));
        List<dawDTO> result = dawService.getAllDaws();
        assertEquals(1, result.size());
        assertEquals("daw-123", result.get(0).getDawId());
        assertEquals("Metal Rig", result.get(0).getName());
        assertEquals(1L, result.get(0).getUserId());
        assertEquals(1, result.get(0).getListOfConfigs().size());
    }

    @Test
    void getDawById_success() {
        when(dawRepository.findById("daw-123")).thenReturn(Optional.of(daw));
        dawDTO result = dawService.getDawById("daw-123");
        assertEquals("daw-123", result.getDawId());
        assertEquals("Metal Rig", result.getName());
        assertEquals(1, result.getListOfConfigs().size());
    }

    @Test
    void getDawById_notFound_throwsException() {
        when(dawRepository.findById("missing")).thenReturn(Optional.empty());
        assertThrows(dawNotFoundException.class, () -> dawService.getDawById("missing"));
    }

    @Test
    void getDawsByUserId_success() {
        when(dawRepository.findByUserId(1L)).thenReturn(Optional.of(List.of(daw)));
        List<dawDTO> result = dawService.getDawsByUserId(1L);
        assertEquals(1, result.size());
        assertEquals("Metal Rig", result.get(0).getName());
        assertNull(result.get(0).getListOfConfigs());
    }

    @Test
    void getDawsByUserId_noResults_throwsException() {
        when(dawRepository.findByUserId(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> dawService.getDawsByUserId(1L));
    }

//    @Test
//    void createDaw_success() {
//        user.setDaws(new java.util.ArrayList<>());
//        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
//        dawService.createDaw(1L, "New Project");
//        assertEquals(1, user.getDaws().size());
//        verify(dawRepository).save(any(DawEntity.class));
//    }

    @Test
    void saveDaw_success() {
        dawDTO dto = new dawDTO(
            "daw-123",
            1L,
            "Metal Rig",
            "High gain setup",
            LocalDateTime.now(),
            0,
            List.of(
                new configDTO(
                    300L,
                    "Metal Config",
                    "daw-123",
                    List.of(
                        new componentDTO(
                            200L,
                            "comp-1",
                            "Amp",
                            "EFFECT",
                            300L,
                            new settingsDTO(
                                100L,
                                "VST",
                                "AmpSim",
                                Map.of("gain", 7)
                            )
                        )
                    )
                )
            )
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(dawRepository.findById("daw-123")).thenReturn(Optional.of(daw));
        when(dawRepository.save(any(DawEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
        dawService.saveDaw(dto);
        verify(dawRepository).save(any(DawEntity.class));
    }
}