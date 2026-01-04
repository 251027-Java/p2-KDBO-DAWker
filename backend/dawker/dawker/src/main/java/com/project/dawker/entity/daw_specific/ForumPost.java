package com.project.dawker.entity.daw_specific;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.project.dawker.entity.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "forum_posts")
public class ForumPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String postType; // e.g., "HELP", "SHOWCASE", "COLLAB"

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({ "daws", "posts", "presets" })
    private User author;

    // We fetch comments only when needed (Lazy Loading)
    @OneToMany(mappedBy = "parentPost", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments;

    // Tags for your "Forum Keys"
    @ElementCollection
    private List<String> tags;
}