package com.project.dawker.dto.recievedDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class recievedRatingsCommentDTO {

    private String dawId;
    private double rating;
    private Long ratingsPageId;
    private Long userId;
    private String username;
    private String comment;
    private LocalDateTime createdAt;

}