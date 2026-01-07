package com.project.dawker.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class forumPostDTO {

    private Long id;
    private String title;
    private String description;
    private String postType;
    private LocalDateTime createdAt;
    private Long userId;
    private String username;
    private List<commentDTO> comments;

    public forumPostDTO(
            Long id,
            String title,
            String description,
            String postType,
            LocalDateTime createdAt,
            Long userId,
            List<commentDTO> comments,
            String username) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.postType = postType;
        this.createdAt = createdAt;
        this.userId = userId;
        this.comments = comments;
        this.username = username;

    }

    public forumPostDTO(
            Long id,
            String title,
            String description,
            String postType,
            LocalDateTime createdAt,
            Long userId,
            String username) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.postType = postType;
        this.createdAt = createdAt;
        this.userId = userId;
        this.username = username;
    }
}