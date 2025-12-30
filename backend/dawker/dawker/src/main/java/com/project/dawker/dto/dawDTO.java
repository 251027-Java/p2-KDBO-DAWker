package com.project.dawker.dto;

import java.util.List;

public class dawDTO {

    private String id;
    private Long userId;
    private String name;
    private List<configDTO> listOfConfigs;

    public dawDTO() {
    }

    public dawDTO(String id, Long userId, String name, List<configDTO> listOfConfigs) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.listOfConfigs = listOfConfigs;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<configDTO> getListOfConfigs() {
        return listOfConfigs;
    }

    public void setListOfConfigs(List<configDTO> listOfConfigs) {
        this.listOfConfigs = listOfConfigs;
    }

}
