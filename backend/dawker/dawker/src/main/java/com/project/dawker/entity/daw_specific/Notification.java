package com.project.dawker.entity.daw_specific;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long recipientId; // Targeted User ID
    private String message; // "User_X replied to your post: Neon_Valley"
    private String actionUrl; // e.g., "/forumPage/12"

    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();

}
