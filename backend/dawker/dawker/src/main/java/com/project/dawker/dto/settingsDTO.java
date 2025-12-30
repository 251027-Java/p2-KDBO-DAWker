package com.project.dawker.dto;

import java.util.Map;

public class settingsDTO {

    private Long id;
    private String technology; // 'RNBO' | 'TONEJS'
    private String exportName;
    private Map<String, Object> parameters; // JSON string representing parameters

    public settingsDTO() {
    }

    public settingsDTO(Long id, String technology, String exportName, Map<String, Object> parameters) {
        this.id = id;
        this.technology = technology;
        this.exportName = exportName;
        this.parameters = parameters;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getTechnology() {
        return technology;
    }

    public String getExportName() {
        return exportName;
    }

    public Map<String, Object> getParameters() {
        return parameters;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setTechnology(String technology) {
        this.technology = technology;
    }

    public void setExportName(String exportName) {
        this.exportName = exportName;
    }

    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }

    @Override
    public String toString() {
        return "settingsDTO{" +
                "id=" + id +
                ", technology='" + technology + '\'' +
                ", exportName='" + exportName + '\'' +
                ", parameters=" + parameters +
                '}';
    }
}
