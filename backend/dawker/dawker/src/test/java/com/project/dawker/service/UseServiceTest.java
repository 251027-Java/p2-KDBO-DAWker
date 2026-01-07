package com.project.dawker.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.project.dawker.dto.userDTO;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.DawEntity;
import com.project.dawker.entity.daw_specific.ForumPost;
import com.project.dawker.exception.UserNotFoundException;
import com.project.dawker.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UseServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private useService userService;

    private User user;
    private DawEntity daw;
    private ForumPost post;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testUser");
        user.setPassword("password123");
        user.setEmail("test@email.com");
        user.setRole("USER");

        daw = new DawEntity();
        daw.setId("daw-uuid-1");
        daw.setName("Metal Rig");
        daw.setDescription("High gain setup");
        daw.setExportCount(5);
        daw.setUser(user);
        daw.setCreatedAt(LocalDateTime.now());

        post = new ForumPost();
        post.setId(10L);
        post.setTitle("First Post");
        post.setDescription("Post content");
        post.setPostType("DISCUSSION");
        post.setCreatedAt(LocalDateTime.now());
        post.setAuthor(user);

        user.setDaws(List.of(daw));
        user.setPosts(List.of(post));
    }

    @Test
    void getAllUsers_returnsMappedDTOs() {
        when(userRepository.findAll()).thenReturn(List.of(user));

        List<userDTO> result = userService.getAllUsers();

        assertEquals(1, result.size());
        userDTO dto = result.get(0);

        assertEquals(user.getId(), dto.getId());
        assertEquals("testUser", dto.getUsername());
        assertEquals(1, dto.getDaws().size());
        assertEquals(1, dto.getForumPosts().size());

        verify(userRepository, times(1)).findAll();
    }

    @Test
    void getUserById_whenUserExists_returnsUserDTO() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userDTO dto = userService.getUserById(1L);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("testUser", dto.getUsername());
        assertEquals(1, dto.getDaws().size());

        verify(userRepository).findById(1L);
    }

    @Test
    void getUserById_whenUserDoesNotExist_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserById(99L));

        verify(userRepository).findById(99L);
    }

    @Test
    void loginUser_withCorrectCredentials_returnsUserDTO() {
        when(userRepository.findByEmailContainingIgnoreCase("test@email.com")).thenReturn(Optional.of(user));

        userDTO dto = userService.loginUser("test@email.com", "password123");

        assertNotNull(dto);
        assertEquals("testUser", dto.getUsername());

        verify(userRepository).findByEmailContainingIgnoreCase("test@email.com");
    }

    @Test
    void loginUser_withWrongPassword_returnsNull() {
        when(userRepository.findByEmailContainingIgnoreCase("test@email.com")).thenReturn(Optional.of(user));

        userDTO dto = userService.loginUser("test@email.com", "wrongPassword");

        assertNull(dto);
    }

    @Test
    void loginUser_whenUserNotFound_returnsNull() {
        when(userRepository.findByEmailContainingIgnoreCase("missing@email.com")).thenReturn(Optional.empty());

        userDTO dto = userService.loginUser("missing@email.com", "password");

        assertNull(dto);
    }
}
