package com.project.dawker.dto.recievedDto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class receivedForumDTO { // Renamed for standard Java naming (PascalCase)

    private String title;
    private String description;
    private String postType;
    private Long userId;
    private LocalDateTime createdAt;

    // comments can be a list of another DTO or a generic Map/Object if not yet
    // defined
    private List<receivedCommentDTO> comments;

    // Custom constructor for flexibility
    public receivedForumDTO(
            String title,
            String description,
            String postType,
            Long userId,
            LocalDateTime createdAt,
            List<receivedCommentDTO> comments) {
        this.title = title;
        this.description = description;
        this.postType = postType;
        this.userId = userId;
        this.createdAt = createdAt;
        this.comments = comments;
    }
}
