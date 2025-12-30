package com.project.dawker.dto;

public class componentDTO {
    private Long id;
    private String instanceId; // From React Date.now()
    private String name;
    private String type;
    private Long configId;
    private settingsDTO settings;

    public componentDTO() {
    }

    public componentDTO(Long id, String instanceId, String name, String type, Long configId,
            settingsDTO settings) {
        this.id = id;
        this.instanceId = instanceId;
        this.name = name;
        this.type = type;
        this.configId = configId;
        this.settings = settings;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInstanceId() {
        return instanceId;
    }

    public void setInstanceId(String instanceId) {
        this.instanceId = instanceId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getConfigId() {
        return configId;
    }

    public void setConfigId(Long configId) {
        this.configId = configId;
    }

    public settingsDTO getSettings() {
        return settings;
    }

    public void setSettings(settingsDTO settings) {
        this.settings = settings;
    }
}