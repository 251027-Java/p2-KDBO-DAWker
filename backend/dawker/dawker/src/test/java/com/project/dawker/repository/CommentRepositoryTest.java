package com.project.dawker.repository;

import com.project.dawker.entity.daw_specific.Comment;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)

class CommentRepositoryTest {
    @Autowired
    private CommentRepository commentRepository;

    @Test
    void findById_ReturnTrue() {
        Comment testComment = new Comment();
        testComment.setContent("This is a test comment.");
        Comment savedComment = commentRepository.save(testComment);

        Optional<Comment> retrievedComment = commentRepository.findById(savedComment.getId());
        assertThat(retrievedComment).isPresent();
        assertThat(retrievedComment.get().getContent()).isEqualTo("This is a test comment.");
    }
}
