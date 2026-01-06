package com.project.dawker.dto;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class commentDTO {

    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Long parentPostId;
    private Long userId;

    public commentDTO(
            Long id,
            String content,
            LocalDateTime createdAt,
            Long parentPostId,
            Long userId) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.parentPostId = parentPostId;
        this.userId = userId;
    }

}
