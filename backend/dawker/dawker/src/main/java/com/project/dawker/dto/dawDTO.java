package com.project.dawker.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Generates ALL getters, setters, and toString
@Data
@NoArgsConstructor // Generates empty constructor (Essential for Jackson)
public class dawDTO {

    private String dawId;
    private Long userId;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private int exportCount;
    private List<configDTO> listOfConfigs;

    public dawDTO(
            String dawId,
            Long userId,
            String name,
            String description,
            LocalDateTime createdAt,
            int exportCount,
            List<configDTO> listOfConfigs) {
        this.dawId = dawId;
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.exportCount = exportCount;
        this.listOfConfigs = listOfConfigs;
    }

    public dawDTO(
            String dawId,
            Long userId,
            String name,
            String description,
            LocalDateTime createdAt,
            int exportCount) {
        this.dawId = dawId;
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.exportCount = exportCount;
    }

    // public String getDawId() {
    // return dawId;
    // }

    // public void setDawId(String dawId) {
    // this.dawId = dawId;
    // }

    // public Long getUserId() {
    // return userId;
    // }

    // public void setUserId(Long userId) {
    // this.userId = userId;
    // }

    // public String getName() {
    // return name;
    // }

    // public void setName(String name) {
    // this.name = name;
    // }

    // public List<configDTO> getListOfConfigs() {
    // return listOfConfigs;
    // }

    // public void setListOfConfigs(List<configDTO> listOfConfigs) {
    // this.listOfConfigs = listOfConfigs;
    // }

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