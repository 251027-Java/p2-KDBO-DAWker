package com.project.dawker.dto;

import java.util.List;
import com.project.dawker.dto.recievedDto.recievedRatingsCommentDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor // Essential for Jackson to reconstruct the object from JSON
public class ratingsPageDTO {

    private Long id;
    private String dawId;
    private double rating;
    private List<recievedRatingsCommentDTO> comments;

    // Full constructor for manual mapping
    public ratingsPageDTO(Long id, String dawId, double rating, List<recievedRatingsCommentDTO> comments) {
        this.id = id;
        this.dawId = dawId;
        this.rating = rating;
        this.comments = comments;
    }

    // Constructor without ID (useful for creating "new" ratings before they hit the
    // DB)
    public ratingsPageDTO(String dawId, double rating, List<recievedRatingsCommentDTO> comments) {
        this.dawId = dawId;
        this.rating = rating;
        this.comments = comments;
    }

    @Override
    public String toString() {
        return "ratingsPageDTO{" +
                "id=" + id +
                ", dawId=" + dawId +
                ", rating=" + rating +
                ", commentsCount=" + (comments != null ? comments.size() : 0) +
                '}';
    }
}