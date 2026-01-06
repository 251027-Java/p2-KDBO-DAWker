package com.project.dawker.dto;

import java.util.List;

import com.project.dawker.dto.recievedDto.recievedSessionNotesDTO;

public class userDTO {

    private Long id;
    private String username;
    private String password;
    private String email;
    private String role;
    private List<dawDTO> daws;
    private List<forumPostDTO> forumPosts;
    private List<recievedSessionNotesDTO> notes;

    public userDTO() {
    }

    public userDTO(
            Long id,
            String username,
            String password,
            String email,
            String role,
            List<dawDTO> daws,
            List<forumPostDTO> forumPosts,
            List<recievedSessionNotesDTO> notes) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.daws = daws;
        this.forumPosts = forumPosts;
        this.notes = notes;
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

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public List<dawDTO> getDaws() {
        return daws;
    }

    public List<forumPostDTO> getForumPosts() {
        return forumPosts;
    }

    public List<recievedSessionNotesDTO> getSessionNotes() {
        return notes;
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

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setDaws(List<dawDTO> daws) {
        this.daws = daws;
    }

    public void setForumPosts(List<forumPostDTO> forumPosts) {
        this.forumPosts = forumPosts;
    }

    public void setSessionNotes(List<recievedSessionNotesDTO> notes) {
        this.notes = notes;
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
