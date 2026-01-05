package com.project.dawker.entity.daw_specific;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class RatingsComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @ManyToOne()
    @JoinColumn(name = "ratings_page_id")
    private RatingsPage ratingsPage;

    private String dawId;
    private double rating;
    private LocalDateTime createdAt;
    private String username;
    private String comment;

    RatingsComment(Long userId, double rating, String username, String comment, RatingsPage ratingsPage) {
        this.userId = userId;
        this.rating = rating;
        this.username = username;
        this.comment = comment;
        this.ratingsPage = ratingsPage;
    }

    @Override
    public String toString() {
        return "RatingsComment{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", comment='" + comment + '\'' +
                ", rating=" + rating +
                ", dawId='" + dawId + '\'' +
                ", parentPageId=" + (ratingsPage != null ? ratingsPage.getId() : "null") +
                '}';
    }
}
