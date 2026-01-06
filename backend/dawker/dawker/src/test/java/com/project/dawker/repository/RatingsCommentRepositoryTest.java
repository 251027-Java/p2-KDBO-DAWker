package com.project.dawker.repository;

import com.project.dawker.entity.daw_specific.RatingsComment;
import com.project.dawker.entity.daw_specific.DawEntity;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.RatingsPage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class RatingsCommentRepositoryTest {
    
    @Autowired
    private RatingsCommentRepository ratingsCommentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DawRepository dawRepository;
    @Autowired
    private RatingsPageRepository ratingsPageRepository;

    private User testUser;
    private User savedUser;
    private DawEntity testDaw;
    private DawEntity savedDaw;
    private RatingsPage testRatingsPage;
    private RatingsPage savedRatingsPage;
    private RatingsComment testRatingsComment;

    @BeforeEach
    void setUp() {
        ratingsCommentRepository.deleteAll();
        userRepository.deleteAll();
        dawRepository.deleteAll();

        testUser = new User();
        testUser.setUsername("john_doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("securepassword");
        testUser.setRole("USER");
        savedUser = userRepository.save(testUser);

        testDaw = new DawEntity();
        testDaw.setName("Test Daw");
        testDaw.setUser(savedUser);
        savedDaw = dawRepository.save(testDaw);

        testRatingsPage = new RatingsPage();
        testRatingsPage.setDawId(savedDaw.getId().toString());
        savedRatingsPage = ratingsPageRepository.save(testRatingsPage);

        testRatingsComment = new RatingsComment();
        testRatingsComment.setUserId(savedUser.getId());
        testRatingsComment.setDawId(savedDaw.getId());
        testRatingsComment.setRatingsPage(savedRatingsPage);
        testRatingsComment.setComment("Great DAW!");
        testRatingsComment.setRating(4.5);
    }

    @Test
    void findByUserIdAndDawId_ReturnsRatingsComment() {
        Optional<RatingsComment> retrievedComment = ratingsCommentRepository.findByUserIdAndDawId(savedUser.getId(), savedDaw.getId());
        assertThat(retrievedComment).isPresent();
        assertThat(retrievedComment.get().getComment()).isEqualTo("Great DAW!");
    }

    @Test
    void findFirstByUserIdOrderByCreatedAtDesc_ReturnsLatestRatingsComment() {
        Optional<RatingsComment> retrievedComment = ratingsCommentRepository.findFirstByUserIdOrderByCreatedAtDesc(savedUser.getId());
        assertThat(retrievedComment).isPresent();
        assertThat(retrievedComment.get().getComment()).isEqualTo("Great DAW!");
    }
}
