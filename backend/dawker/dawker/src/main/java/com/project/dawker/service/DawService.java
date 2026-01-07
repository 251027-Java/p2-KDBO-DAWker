
package com.project.dawker.service;

import java.util.List;
import java.util.stream.Collectors;

import com.project.dawker.exceptions.dawNotFoundException;
import org.springframework.stereotype.Service;

import com.project.dawker.dto.componentDTO;
import com.project.dawker.dto.configDTO;
import com.project.dawker.dto.dawDTO;
import com.project.dawker.dto.settingsDTO;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.ComponentEntity;
import com.project.dawker.entity.daw_specific.ConfigEntity;
import com.project.dawker.entity.daw_specific.DawEntity;
import com.project.dawker.entity.daw_specific.SettingsEntity;
import com.project.dawker.repository.ConfigRepository;
import com.project.dawker.repository.DawRepository;
import com.project.dawker.repository.UserRepository;

// Add some more personal Error checks later.
// DAW SERVICE PRANAV!!!!
@Service
public class DawService {

    private final DawRepository dawRepository;
    private final UserRepository userRepository;
    private final ConfigRepository configRepository;

    public DawService(DawRepository dawRepository, UserRepository userRepository, ConfigRepository configRepository) {
        this.dawRepository = dawRepository;
        this.userRepository = userRepository;
        this.configRepository = configRepository;
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
                        config.getComponents().stream()
                                .map(this::mapToComponentDto)
                                .collect(Collectors.toList())))
                .collect(Collectors.toList());

        return new dawDTO(daw.getId(), daw.getUser().getId(), daw.getName(), daw.getDescription(), daw.getCreatedAt(),
                daw.getExportCount(), configs);
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

    // private configDTO mapToConfigDto(ConfigEntity config) {
    // List<componentDTO> components = config.getComponentChain().stream()
    // .map(this::mapToComponentDto)
    // .collect(Collectors.toList());

    // return new configDTO(
    // config.getId(),
    // config.getName(),
    // config.getDaw().getId(),
    // components);
    // }

    // Mapping DTO to entities can be added here as needed

    // private DawEntity mapToDawEntity(dawDTO dto) {
    // // Implementation for mapping dawDTO to DawEntity
    // DawEntity daw = new DawEntity();
    // daw.setId(dto.getDawId());
    // daw.setName(dto.getName());
    // daw.setUser(this.userRepository.getReferenceById(dto.getUserId()));
    // daw.setListOfConfigs(dto.getListOfConfigs().stream().map(this::mapToConfigEntity).collect(Collectors.toList()));
    // return daw;
    // }

    private ComponentEntity mapToComponentEntity(componentDTO dto) {
        // Implementation for mapping componentDTO to ComponentEntity
        ComponentEntity component = new ComponentEntity();
        component.setId(dto.getId());
        component.setInstanceId(dto.getInstanceId());
        component.setName(dto.getName());
        component.setType(dto.getType());
        component.setConfig(this.configRepository.getReferenceById(dto.getConfigId()));
        component.setSettings(mapToSettingsEntity(dto.getSettings()));
        return component;
    }

    private ConfigEntity mapToConfigEntity(configDTO dto) {
        // Implementation for mapping configDTO to ConfigEntity

        ConfigEntity config = new ConfigEntity();
        config.setId(dto.getId());
        config.setName(dto.getName());
        config.setDaw(this.dawRepository.findById(dto.getDawId()).orElseThrow());
        config.setComponents(
                dto.getComponents().stream().map(this::mapToComponentEntity).collect(Collectors.toList()));
        return config;
    }

    private SettingsEntity mapToSettingsEntity(settingsDTO dto) {
        // Implementation for mapping settingsDTO to SettingsEntity
        SettingsEntity settings = new SettingsEntity();
        settings.setId(dto.getId());
        settings.setTechnology(dto.getTechnology());
        settings.setExportName(dto.getExportName());
        settings.setParameters(dto.getParameters());
        return settings;
    }

    // Get DAW without full details (For searching/listing)
    public List<dawDTO> getDawsByUserId(Long userId) {
        return this.dawRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No DAWs found for user ID: " + userId))
                .stream()
                .map(daw -> new dawDTO(daw.getId(), daw.getUser().getId(), daw.getName(), daw.getDescription(),
                        daw.getCreatedAt(), daw.getExportCount()))
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
    // Create a new DAW with configurations, components, settingspublic dawDTO
    // saveDaw(dawDTO dto) {
    // 1. Resolve the User (Required for both new and existing)
    public dawDTO saveDaw(dawDTO dto) {
        // 1. Resolve User
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));

        DawEntity entity;

        // 2. Resolve or Create DAW
        if (dto.getDawId() != null && !dto.getDawId().isEmpty()) {
            entity = dawRepository.findById(dto.getDawId())
                    .orElseThrow(() -> new dawNotFoundException("DAW not found: " + dto.getDawId()));
        } else {
            entity = new DawEntity();
            entity.setUser(user);
        }

        // 3. Map Basic Fields
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());

        // 4. Map the Hierarchy (Passing 'entity' down to prevent findById(null))
        if (dto.getListOfConfigs() != null) {
            // 1. Get the reference to the existing persistent list
            List<ConfigEntity> existingConfigs = entity.getListOfConfigs();

            // 2. Clear the contents (this triggers orphan removal correctly)
            existingConfigs.clear();

            // 3. Map the DTOs and add them to the EXISTING list
            List<ConfigEntity> newConfigs = dto.getListOfConfigs().stream()
                    .map(configDto -> mapToConfigEntity(configDto, entity))
                    .collect(Collectors.toList());

            existingConfigs.addAll(newConfigs);
        }

        // 5. Save everything (CascadeType.ALL will handle child entities)
        DawEntity savedEntity = dawRepository.save(entity);
        return mapToDawDto(savedEntity);
    }

    private ConfigEntity mapToConfigEntity(configDTO dto, DawEntity parentDaw) {
        ConfigEntity config = new ConfigEntity();
        config.setId(dto.getId());
        config.setName(dto.getName());
        config.setDaw(parentDaw); // Link back to parent

        config.setComponents(dto.getComponents().stream()
                .map(compDto -> mapToComponentEntity(compDto, config)) // Pass config down
                .collect(Collectors.toList()));
        return config;
    }

    private ComponentEntity mapToComponentEntity(componentDTO dto, ConfigEntity parentConfig) {
        ComponentEntity component = new ComponentEntity();
        component.setId(dto.getId());
        component.setInstanceId(dto.getInstanceId());
        component.setName(dto.getName());
        component.setType(dto.getType());
        component.setConfig(parentConfig); // Link back to parent

        if (dto.getSettings() != null) {
            component.setSettings(mapToSettingsEntity(dto.getSettings()));
        }
        return component;
    }

    // private SettingsEntity mapToSettingsEntity(settingsDTO dto) {
    // SettingsEntity settings = new SettingsEntity();
    // settings.setId(dto.getId());
    // settings.setTechnology(dto.getTechnology());
    // settings.setExportName(dto.getExportName());
    // settings.setParameters(dto.getParameters());
    // return settings;
    // }

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
