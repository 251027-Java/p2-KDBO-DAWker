package com.project.dawker.service;

import java.util.List;
import java.util.stream.Collectors;

import com.project.dawker.kafka.KafkaLogProducer;
import org.springframework.stereotype.Service;

import com.project.dawker.dto.dawDTO;
import com.project.dawker.dto.forumPostDTO;
import com.project.dawker.dto.recievedDto.recievedSessionNotesDTO;
import com.project.dawker.dto.userDTO;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.DawEntity;
import com.project.dawker.entity.daw_specific.ForumPost;
import com.project.dawker.entity.daw_specific.sessionNotes;
import com.project.dawker.exception.UserNotFoundException;
import com.project.dawker.repository.UserRepository;

// USER SERVICE PRANAV!!!!
@Service
public class useService {

        private final UserRepository userRepository;
        private final KafkaLogProducer logger;

        public useService(UserRepository userRepository, KafkaLogProducer logProducer) {
                this.userRepository = userRepository;
                logger = logProducer;
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
                                post.getAuthor().getId(),
                                post.getAuthor().getUsername());
        }

        private recievedSessionNotesDTO mapToSessionNoteDTO(sessionNotes entity) {

                if (entity == null)
                        return null;

                return new recievedSessionNotesDTO(
                                entity.getId(),
                                entity.getAuthor() != null ? entity.getAuthor().getId() : null,
                                entity.getTitle(),
                                entity.getContent());
        }

        // 3. Main Mapping Function: User Entity -> UserDTO
        public userDTO mapToUserDTO(User user) {
                logger.info("service-calls", "", "useService", "mapToUserDTO");

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
                logger.info("service-calls", "", "useService", "getAllUsers");

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
                                                                                posts.getAuthor().getId(),
                                                                                posts.getAuthor().getUsername()))
                                                                .toList(),
                                                user.getNotes().stream().map(this::mapToSessionNoteDTO).toList()))
                                .collect(Collectors.toList());
        }

        public userDTO getUserById(Long id) {
                logger.info("service-calls", "", "useService", "getUserById");
                return this.userRepository.findById(id).map(this::mapToUserDTO)
                                .orElseThrow(() -> new UserNotFoundException("User could not be found by that Id"));
        }

        public userDTO loginUser(String email, String password) {
                logger.info("service-calls", "", "useService", "loginUser");
                return this.userRepository.findByEmailContainingIgnoreCase(email)
                                .filter(user -> user.getPassword().equals(password))
                                .map(this::mapToUserDTO)
                                .orElse(null);
        }

        // Register a new user. Returns null on conflict (existing username or email).
        public userDTO registerUser(userDTO userDto) {
                logger.info("service-calls", "", "useService", "registerUser");
                if (userDto == null) {
                        logger.debug("service-calls", "userDto = null", "useService", "registerUser");
                        return null;
                }

                if (userRepository.existsByUsername(userDto.getUsername())) {
                        logger.debug("service-calls", "username already exists", "useService", "registerUser");
                        return null;
                }

                if (userDto.getEmail() != null && userRepository.findByEmailContainingIgnoreCase(userDto.getEmail()).isPresent()) {
                        logger.debug("service-calls", "email contained in an already existing email", "useService", "registerUser");
                        logger.warn("service-calls", "user registration may fail even if this exact email (ignoring case) isn't already being used", "useService", "registerUser");
                        logger.trace("service-calls", "email attempting to register with: " + userDto.getEmail(), "useService", "registerUser");
                        logger.trace("service-calls", "already existing email failing user registration: " + userRepository.findByEmailContainingIgnoreCase(userDto.getEmail()).get().getEmail(), "useService", "registerUser");
                        return null;
                }

                User user = new User();
                user.setUsername(userDto.getUsername());
                user.setEmail(userDto.getEmail());
                user.setPassword(userDto.getPassword());
                user.setRole(userDto.getRole() != null ? userDto.getRole() : "USER");

                User saved = userRepository.save(user);
                return mapToUserDTO(saved);
        }

        // Update existing user. Returns null if not found.
        public userDTO updateUser(userDTO userDto) {
                logger.info("service-calls", "", "useService", "updateUser");
                if (userDto == null || userDto.getId() == null) {
                        return null;
                }

                return userRepository.findById(userDto.getId()).map(user -> {
                        if (userDto.getUsername() != null) {
                                user.setUsername(userDto.getUsername());
                        }
                        if (userDto.getPassword() != null) {
                                user.setPassword(userDto.getPassword());
                        }
                        if (userDto.getEmail() != null) {
                                user.setEmail(userDto.getEmail());
                        }
                        User saved = userRepository.save(user);
                        return mapToUserDTO(saved);
                }).orElse(null);
        }

        // Delete user by id. Returns true if deleted, false if not found.
        public boolean deleteUser(Long id) {
                logger.info("service-calls", "", "useService", "deleteUser");
                if (id == null || !userRepository.existsById(id)) {
                        return false;
                }
                userRepository.deleteById(id);
                return true;
        }

}
