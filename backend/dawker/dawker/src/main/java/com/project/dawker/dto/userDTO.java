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
}
