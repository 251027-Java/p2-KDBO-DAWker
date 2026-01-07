package com.project.dawker.service;

import com.project.dawker.dto.commentDTO;
import com.project.dawker.dto.forumPostDTO;
import com.project.dawker.dto.recievedDto.receivedCommentDTO;
import com.project.dawker.dto.recievedDto.receivedForumDTO;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.Comment;
import com.project.dawker.entity.daw_specific.ForumPost;
import com.project.dawker.exception.ForumNotFoundException;
import com.project.dawker.exception.UserNotFoundException;
import com.project.dawker.kafka.KafkaLogProducer;
import com.project.dawker.repository.CommentRepository;
import com.project.dawker.repository.ForumPostRepository;
import com.project.dawker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ForumServiceTest {

    @Mock
    private ForumPostRepository forumRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private KafkaLogProducer logger;

    @InjectMocks
    private forumService forumService;

    private User user;
    private ForumPost post;
    private Comment comment;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        post = new ForumPost();
        post.setId(10L);
        post.setTitle("Help with mixing");
        post.setDescription("How do I clean up mud?");
        post.setPostType("HELP");
        post.setCreatedAt(LocalDateTime.now());
        post.setAuthor(user);

        comment = new Comment();
        comment.setId(100L);
        comment.setContent("Try EQ cuts at 300Hz");
        comment.setCreatedAt(LocalDateTime.now());
        comment.setParentPost(post);
        comment.setAuthor(user);

        post.setComments(List.of(comment));
    }

    @Test
    void mapToDto_success() {
        forumPostDTO dto = forumService.mapToDto(post);

        assertEquals(10L, dto.getId());
        assertEquals("Help with mixing", dto.getTitle());
        assertEquals(1L, dto.getUserId());
        assertEquals(1, dto.getComments().size());

        commentDTO commentDto = dto.getComments().get(0);
        assertEquals(100L, commentDto.getId());
        assertEquals("Try EQ cuts at 300Hz", commentDto.getContent());
    }

    @Test
    void getAllForums_success() {
        when(forumRepository.findAll()).thenReturn(List.of(post));

        List<forumPostDTO> result = forumService.getAllForums();

        assertEquals(1, result.size());
        assertEquals("Help with mixing", result.get(0).getTitle());
    }

    @Test
    void getForumById_success() {
        when(forumRepository.findById(10L)).thenReturn(Optional.of(post));

        forumPostDTO result = forumService.getForumById(10L);

        assertEquals(10L, result.getId());
        assertEquals("HELP", result.getPostType());
    }

    @Test
    void getForumById_notFound_throwsException() {
        when(forumRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ForumNotFoundException.class, () -> forumService.getForumById(99L));
    }

    @Test
    void saveForum_success() {
        receivedForumDTO dto = new receivedForumDTO();
        dto.setTitle("New Post");
        dto.setDescription("Check out my setup");
        dto.setPostType("SHOWCASE");
        dto.setUserId(1L);
        dto.setCreatedAt(LocalDateTime.now());

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(forumRepository.save(any(ForumPost.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ForumPost saved = forumService.saveForum(dto);

        assertEquals("New Post", saved.getTitle());
        assertEquals(user, saved.getAuthor());
        verify(forumRepository).save(any(ForumPost.class));
    }

    @Test
    void saveForum_userNotFound_throwsException() {
        receivedForumDTO dto = new receivedForumDTO();
        dto.setUserId(99L);

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> forumService.saveForum(dto));
    }

    @Test
    void saveComment_success() {
        receivedCommentDTO dto = new receivedCommentDTO();
        dto.setContent("Nice rig!");
        dto.setParentPostId(10L);
        dto.setUserId(1L);
        dto.setCreatedAt(LocalDateTime.now());

        when(forumRepository.findById(10L)).thenReturn(Optional.of(post));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Comment saved = forumService.saveComment(dto);

        assertEquals("Nice rig!", saved.getContent());
        assertEquals(post, saved.getParentPost());
        assertEquals(user, saved.getAuthor());
    }

    @Test
    void saveComment_forumNotFound_throwsException() {
        receivedCommentDTO dto = new receivedCommentDTO();
        dto.setParentPostId(99L);
        dto.setUserId(1L);

        when(forumRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ForumNotFoundException.class, () -> forumService.saveComment(dto));
    }

    @Test
    void saveComment_userNotFound_throwsException() {
        receivedCommentDTO dto = new receivedCommentDTO();
        dto.setParentPostId(10L);
        dto.setUserId(99L);

        when(forumRepository.findById(10L)).thenReturn(Optional.of(post));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> forumService.saveComment(dto));
    }
}
