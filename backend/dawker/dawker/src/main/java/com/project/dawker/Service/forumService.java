package com.project.dawker.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.project.dawker.kafka.KafkaLogProducer;
import org.springframework.stereotype.Service;

import com.project.dawker.dto.commentDTO;
import com.project.dawker.dto.forumPostDTO;
import com.project.dawker.dto.recievedDto.receivedCommentDTO;
import com.project.dawker.dto.recievedDto.receivedForumDTO;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.Comment;
import com.project.dawker.entity.daw_specific.ForumPost;
import com.project.dawker.exception.ForumNotFoundException;
import com.project.dawker.exception.UserNotFoundException;
import com.project.dawker.repository.CommentRepository;
import com.project.dawker.repository.ForumPostRepository;
import com.project.dawker.repository.UserRepository;

@Service
public class forumService {

    private final ForumPostRepository forumRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final KafkaLogProducer logger;

    public forumService(ForumPostRepository forumRepository, UserRepository userRepository,
            CommentRepository commentRepository, KafkaLogProducer logProducer) {
        this.forumRepository = forumRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        logger = logProducer;
    }

    // ---------------maptoDTO---------------------
    public forumPostDTO mapToDto(ForumPost entity) {
        logger.info("service-calls", "", "forumService", "mapToDto");
        logger.debug("service-calls", "Convert the List<Comment> to List<commentDTO>", "forumService", "mapToDto");
        // 1. Convert the List<Comment> to List<commentDTO>
        List<commentDTO> commentDtos = null;
        if (entity.getComments() != null) {
            commentDtos = entity.getComments().stream()
                    .map(comment -> new commentDTO(
                            comment.getId(),
                            comment.getContent(),
                            comment.getCreatedAt(),
                            comment.getParentPost().getId(),
                            comment.getAuthor().getId()))
                    .collect(Collectors.toList());
        }

        logger.debug("service-calls", "Return the forumPostDTO using your full constructor", "forumService", "mapToDto");
        // 2. Return the forumPostDTO using your full constructor
        return new forumPostDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getPostType(),
                entity.getCreatedAt(),
                entity.getAuthor() != null ? entity.getAuthor().getId() : null, // Flatten User to ID
                commentDtos,
                entity.getAuthor().getUsername());
    }

    // --------------------Map to Entity-------------

    public ForumPost mapToEntity(receivedForumDTO dto, User author) {
        logger.info("service-calls", "", "forumService", "mapToEntity");
        if (dto == null) {
            logger.debug("service-calls", "dto = null", "forumService", "mapToEntity");
            return null;
        }

        ForumPost post = new ForumPost();
        post.setTitle(dto.getTitle());
        post.setDescription(dto.getDescription());
        post.setPostType(dto.getPostType());

        // Use the DTO date if provided, otherwise default to now
        post.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now());

        // Set the User object found via your UserRepository
        post.setAuthor(author);

        // Map the internal comments list
        if (dto.getComments() != null) {
            List<Comment> commentEntities = dto.getComments().stream()
                    .map(commentDto -> mapCommentToEntity(commentDto, post, author))
                    .collect(Collectors.toList());
            post.setComments(commentEntities);
        }

        return post;
    }

    private Comment mapCommentToEntity(receivedCommentDTO dto, ForumPost post, User author) {
        Comment comment = new Comment();
        comment.setContent(dto.getContent());
        comment.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now());

        // Link the relationship back to the parent and the author
        comment.setParentPost(post);
        comment.setAuthor(author);

        return comment;
    }

    public List<forumPostDTO> getAllForums() {
        logger.info("service-calls", "", "forumService", "getAllForums");
        return this.forumRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public forumPostDTO getForumById(Long Id) {
        logger.info("service-calls", "", "forumService", "getForumById");
        return this.forumRepository.findById(Id).map(this::mapToDto)
                .orElseThrow(() -> new ForumNotFoundException("Forum request could not be found"));
    }

    // AJFEOA[FGOIEJAG[POJEAOGJ]]
    public List<forumPostDTO> getAllForumsByUserId(Long Id) {
        logger.info("service-calls", "", "forumService", "getAllForumsByUserId");
        logger.error("service-calls", "AJFEOA[FGOIEJAG[POJEAOGJ]]", "forumService", "getAllForumsByUserId", new Exception("anger"));
        return this.forumRepository.findAllByAuthor_Id(Id).stream()
                .map(this::mapToDto).toList();
    }

    // Save methods
    public ForumPost saveForum(receivedForumDTO dto) {
        logger.info("service-calls", "", "forumService", "saveForum");

        User user = this.userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("Cannot save forum. Current user not found in Database"));
        return this.forumRepository.save(mapToEntity(dto, user));
    }

    public Comment saveComment(receivedCommentDTO dto) {
        logger.info("service-calls", "", "forumService", "saveComment");

        ForumPost post = this.forumRepository.findById(dto.getParentPostId())
                .orElseThrow(() -> new ForumNotFoundException("Comment could not be created. Forum not found"));

        User user = this.userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("Comment not created. User could not be found"));

        Comment comment = mapCommentToEntity(dto, post, user);

        return this.commentRepository.save(comment);
    }

}
