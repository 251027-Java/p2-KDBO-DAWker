package com.project.dawker.dto;

import java.util.List;

public class dawDTO {

    private String dawId;
    private Long userId;
    private String name;
    private List<configDTO> listOfConfigs;

    public dawDTO() {

    }

    public dawDTO(String dawId, Long userId, String name, List<configDTO> listOfConfigs) {
        this.dawId = dawId;
        this.userId = userId;
        this.name = name;
        this.listOfConfigs = listOfConfigs;
    }

    public String getDawId() {
        return dawId;
    }

    public void setDawId(String dawId) {
        this.dawId = dawId;
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

    @Override
    public String toString() {
        return "dawDTO{" +
                "dawId='" + dawId + '\'' +
                ", userId=" + userId +
                ", name='" + name + '\'' +
                ", listOfConfigs=" + (listOfConfigs != null ? listOfConfigs.toString() : "null") +
                '}';
    }

}