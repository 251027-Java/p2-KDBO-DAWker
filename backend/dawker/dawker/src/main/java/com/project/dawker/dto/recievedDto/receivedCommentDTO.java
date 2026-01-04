package com.project.dawker.dto.recievedDto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class receivedCommentDTO {

    private LocalDateTime createdAt;
    private Long userId;
    private Long parentPostId;
    private String content;

    public receivedCommentDTO(
            LocalDateTime createdAt,
            Long userId,
            Long parentPostId,
            String content) {
        this.createdAt = createdAt;
        this.userId = userId;
        this.parentPostId = parentPostId;
        this.content = content;
    }
}
