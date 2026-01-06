package com.project.dawker.repository;

import com.project.dawker.entity.daw_specific.ForumPost;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class ForumPostRepositoryTest {
    
    @Autowired
    private ForumPostRepository forumPostRepository;

    private ForumPost testForumPost;

    @BeforeEach
    void setUp() {
        forumPostRepository.deleteAll();
        testForumPost = new ForumPost();
        testForumPost.setTitle("Test Post");
        testForumPost.setPostType("GENERAL");
    }

    @Test
    void findTop3ByOrderByCreatedAtDesc_ReturnTrue() {
        var recentPosts = forumPostRepository.findTop3ByOrderByCreatedAtDesc();
        assertThat(recentPosts).isNotEmpty();
        assertThat(recentPosts.get(0).getTitle()).isEqualTo("Test Post");
    }

    @Test
    void findByPostType_ReturnTrue() {
        var postsByType = forumPostRepository.findByPostType("GENERAL");
        assertThat(postsByType).isNotEmpty();
        assertThat(postsByType.get(0).getTitle()).isEqualTo("Test Post");
    }
}
