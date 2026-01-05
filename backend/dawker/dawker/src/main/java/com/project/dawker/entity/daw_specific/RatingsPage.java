package com.project.dawker.entity.daw_specific;

import java.util.ArrayList;
import java.util.List;

import jakarta.annotation.Generated;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingsPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dawId;
    private double rating;

    // FIX: Change RatingsComment[] to List<RatingsComment>
    // 'cascade' ensures if you save the Page, the Comments save too
    // 'orphanRemoval' ensures if you remove a comment from the list, it's deleted
    // from DB
    @OneToMany(mappedBy = "ratingsPage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RatingsComment> comments = new ArrayList<>();

    // Update your custom constructor
    public RatingsPage(String dawId, double rating, List<RatingsComment> comments) {
        this.dawId = dawId;
        this.rating = rating;
        this.comments = comments;
    }

    @Override
    public String toString() {
        return "RatingsPage{" +
                "id=" + id +
                ", dawId='" + dawId + '\'' +
                ", avgRating=" + rating +
                ", commentCount=" + (comments != null ? comments.size() : 0) +
                '}';
    }
}
