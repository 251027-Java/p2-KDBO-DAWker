package com.project.dawker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dawker.entity.daw_specific.ForumPost;
import com.project.dawker.repository.interfaces.ForumPostSummary;

// public interface ForumPostSummary {
//     Long getId();
//     String getTitle();
//     String getPostType();
//     LocalDateTime getCreatedAt();

//     // Spring "reaches" into the User entity to get just the username
//     @Value("#{target.author.username}")
//     String getAuthorName();
// }

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {

    // This handles your "Most Recent" requirement
    List<ForumPostSummary> findTop3ByOrderByCreatedAtDesc();

    // This handles searching by "Type" or "Tag"
    List<ForumPostSummary> findByPostType(String type);

}
