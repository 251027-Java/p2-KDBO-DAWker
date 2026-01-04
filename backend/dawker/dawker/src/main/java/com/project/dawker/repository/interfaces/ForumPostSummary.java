package com.project.dawker.repository.interfaces;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;

public interface ForumPostSummary {
    Long getId();
    String getTitle();
    String getPostType();
    LocalDateTime getCreatedAt();
    
    // Spring "reaches" into the User entity to get just the username
    @Value("#{target.author.username}")
    String getAuthorName();
}
