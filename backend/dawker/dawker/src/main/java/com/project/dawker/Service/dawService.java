package com.project.dawker.service;

import java.util.List;
import java.util.stream.Collectors;

import com.project.dawker.exceptions.dawNotFoundException;
import org.springframework.stereotype.Service;

import com.project.dawker.dto.componentDTO;
import com.project.dawker.dto.configDTO;
import com.project.dawker.dto.dawDTO;
import com.project.dawker.dto.settingsDTO;
import com.project.dawker.entity.daw_specific.ComponentEntity;
import com.project.dawker.entity.daw_specific.DawEntity;
import com.project.dawker.entity.daw_specific.SettingsEntity;
import com.project.dawker.repository.DawRepository;

// Add some more personal Error checks later.

@Service
public class DawService {

    private final DawRepository dawRepository;

    public DawService(DawRepository dawRepository) {
        this.dawRepository = dawRepository;
    }

    // Gets:
    // Get all DAWs
    // public List<dawDTO> getAllDaws() {
    // return this.dawRepository.findAll().stream()
    // .map(daw -> new dawDTO(daw.getId(), daw.getUser().getId(), daw.getName(),
    // daw.getListOfConfigs().stream()
    // .map(config -> new com.project.dawker.dto.configDTO(
    // config.getId(),
    // config.getName(),
    // daw.getId(),
    // config.getComponentChain().stream()
    // .map(component -> new com.project.dawker.dto.componentDTO(
    // component.getId(),
    // component.getInstanceId(),
    // component.getName(),
    // component.getType(),
    // component.getSettings().

    // stream()
    // .map(setting -> new com.project.dawker.dto.settingDTO(
    // setting.getId(),
    // setting.getKey(),
    // setting.getValue()))
    // .collect(Collectors.toList())))
    // .collect(Collectors.toList())))
    // .collect(Collectors.toList())))
    // .collect(Collectors.toList());
    // }

    public List<dawDTO> getAllDaws() {
        return this.dawRepository.findAll().stream()
                .map(this::mapToDawDto) // cleaner syntax
                .collect(Collectors.toList());
    }

    // Get DAW with full details
    public dawDTO getDawById(String dawId) {
        DawEntity daw = this.dawRepository.findById(dawId)
                .orElseThrow(() -> new dawNotFoundException("DAW not found with ID: " + dawId));
        return mapToDawDto(daw);
    }

    private dawDTO mapToDawDto(DawEntity daw) {
        List<configDTO> configs = daw.getListOfConfigs().stream()
                .map(config -> new configDTO(
                        config.getId(),
                        config.getName(),
                        daw.getId(),
                        config.getComponentChain().stream()
                                .map(this::mapToComponentDto)
                                .collect(Collectors.toList())))
                .collect(Collectors.toList());

        return new dawDTO(daw.getId(), daw.getUser().getId(), daw.getName(), configs);
    }

    private componentDTO mapToComponentDto(ComponentEntity component) {
        // NO STREAM HERE. Just a direct mapping of the single Settings object.
        SettingsEntity settings = component.getSettings();
        settingsDTO settingsDto = new settingsDTO(
                settings.getId(),
                settings.getTechnology(),
                settings.getExportName(),
                settings.getParameters() // The Map<String, Object> goes right in!
        );

        return new componentDTO(
                component.getId(),
                component.getInstanceId(),
                component.getName(),
                component.getType(),
                component.getConfig().getId(),
                settingsDto // Pass the single object, not a list
        );
    }

    // Get DAW without full details (For searching/listing)
    public List<dawDTO> getDawsByUserId(Long userId) {
        return this.dawRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No DAWs found for user ID: " + userId))
                .stream()
                .map(daw -> new dawDTO(daw.getId(), daw.getUser().getId(), daw.getName(), null))
                .collect(Collectors.toList());
    }

    // Get all configurations in daw
    // Get all components in daw
    // Get all settings in daw
    // Get specific configuration by id
    // Get specific component by id
    // Get specific setting by id

    // CRUD
    // Create:
    // Create a new DAW with configurations, components, settings

    // Update:
    // Update DAW information
    // Update configurations
    // Update components
    // Update settings

    // Delete:
    // Delete DAW and all associated data
    // Delete specific configuration
    // Delete specific component
    // Delete specific setting(s)

    //
}
