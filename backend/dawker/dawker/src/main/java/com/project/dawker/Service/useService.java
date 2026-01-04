package com.project.dawker.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.project.dawker.controller.dto.User.UserDTO;
import com.project.dawker.dto.dawDTO;
import com.project.dawker.dto.forumPostDTO;
import com.project.dawker.dto.userDTO;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.DawEntity;
import com.project.dawker.entity.daw_specific.ForumPost;
import com.project.dawker.exception.UserNotFoundException;
import com.project.dawker.repository.UserRepository;

// USER SERVICE PRANAV!!!!
@Service
public class useService {

        private final UserRepository userRepository;

        public useService(UserRepository userRepository) {
                this.userRepository = userRepository;
        }

        // 1. Map DAW Entity to DTO
        private dawDTO mapToDawDTO(DawEntity daw) {
                return new dawDTO(
                                daw.getId(),
                                daw.getUser().getId(),
                                daw.getName(),
                                daw.getDescription(),
                                daw.getCreatedAt(),
                                daw.getExportCount());
        }

        // 2. Map Post Entity to DTO
        private forumPostDTO mapToPostDTO(ForumPost post) {
                return new forumPostDTO(
                                post.getId(),
                                post.getTitle(),
                                post.getDescription(),
                                post.getPostType(),
                                post.getCreatedAt(),
                                post.getAuthor().getId());
        }

        // 3. Main Mapping Function: User Entity -> UserDTO
        public userDTO mapToUserDTO(User user) {
                userDTO dto = new userDTO();
                dto.setId(user.getId());
                dto.setUsername(user.getUsername());
                dto.setPassword(user.getPassword());
                dto.setEmail(user.getEmail());
                dto.setRole(user.getRole());

                // Map the list of DAWs using our helper function
                if (user.getDaws() != null) {
                        dto.setDaws(user.getDaws().stream()
                                        .map(this::mapToDawDTO)
                                        .collect(Collectors.toList()));
                }

                // Map the list of Posts (if you decide to add posts to your userDTO)
                if (user.getPosts() != null) {
                        dto.setForumPosts(user.getPosts().stream()
                                        .map(this::mapToPostDTO)
                                        .collect(Collectors.toList()));
                }

                return dto;
        }

        public List<userDTO> getAllUsers() {
                return this.userRepository.findAll().stream()
                                .map(user -> new userDTO(user.getId(), user.getUsername(), user.getPassword(),
                                                user.getEmail(),
                                                user.getRole(),
                                                user.getDaws().stream()
                                                                .map(daw -> new dawDTO(daw.getId(),
                                                                                daw.getUser().getId(), daw.getName(),
                                                                                daw.getDescription(),
                                                                                daw.getCreatedAt(),
                                                                                daw.getExportCount())) // Simplified
                                                                // dawDTO
                                                                .toList(),
                                                user.getPosts().stream()
                                                                .map(posts -> new forumPostDTO(posts.getId(),
                                                                                posts.getTitle(),
                                                                                posts.getDescription(),
                                                                                posts.getPostType(),
                                                                                posts.getCreatedAt(),
                                                                                posts.getAuthor().getId()))
                                                                .toList()))
                                .collect(Collectors.toList());
        }

        public userDTO getUserById(Long id) {
                return this.userRepository.findById(id).map(this::mapToUserDTO)
                                .orElseThrow(() -> new UserNotFoundException("User could not be found by that Id"));
        }

}
