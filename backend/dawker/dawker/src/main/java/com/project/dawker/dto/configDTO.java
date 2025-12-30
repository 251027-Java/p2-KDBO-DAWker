package com.project.dawker.dto;

import java.util.List;

public class configDTO {

    private Long id;
    private String name;
    private String dawId;
    private List<componentDTO> components;

    public configDTO() {
    }

    public configDTO(Long id, String name, String dawId, List<componentDTO> components) {
        this.id = id;
        this.name = name;
        this.dawId = dawId;
        this.components = components;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDawId() { return dawId; }
    public void setDawId(String dawId) { this.dawId = dawId; }

    public List<componentDTO> getComponents() { return components; }
    public void setComponents(List<componentDTO> components) { this.components = components; }

    @Override
    public String toString() {
        return "configDTO{id=" + id + ", name='" + name + "', components=" + components + "}";
    }

}
