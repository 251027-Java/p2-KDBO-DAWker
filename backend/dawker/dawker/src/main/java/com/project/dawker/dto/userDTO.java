package com.project.dawker.dto;

import java.util.List;

public class userDTO {

    private Long id;
    private String username;
    private String password;
    private String role;
    private List<dawDTO> daws;

    public userDTO() {
    }

    public userDTO(Long id, String username, String password, String role, List<dawDTO> daws) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.daws = daws;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public List<dawDTO> getDaws() {
        return daws;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setDaws(List<dawDTO> daws) {
        this.daws = daws;
    }

    @Override
    public String toString() {
        return "userDTO{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", role='" + role + '\'' +
                ", dawsCount=" + (daws != null ? daws.size() : 0) +
                '}';
    }
}
