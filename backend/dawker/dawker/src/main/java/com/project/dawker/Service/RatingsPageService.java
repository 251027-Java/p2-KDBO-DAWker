package com.project.dawker.service;

import com.project.dawker.kafka.KafkaLogProducer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.project.dawker.dto.ratingsPageDTO;
import com.project.dawker.dto.recievedDto.recievedRatingsCommentDTO;
import com.project.dawker.entity.daw_specific.RatingsPage;
import com.project.dawker.exception.RatingsPageNotFoundException;
import com.project.dawker.entity.daw_specific.RatingsComment;
import com.project.dawker.repository.RatingsCommentRepository;
import com.project.dawker.repository.RatingsPageRepository;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
public class RatingsPageService {

    private final RatingsCommentRepository commentRepo;
    private final RatingsPageRepository ratingsRepo;
    private final KafkaLogProducer logger;

    public RatingsPageService(RatingsCommentRepository commentRepo, RatingsPageRepository ratingsRepo, KafkaLogProducer logProducer) {
        this.commentRepo = commentRepo;
        this.ratingsRepo = ratingsRepo;
        logger = logProducer;
    }

    // Comment object created:
    // id = null
    // dawId=ef386469-4e01-4e5f-a5f3-7a825a2b2f4f,
    // ratingsPageId=null,
    // rating=5.0,
    // userId=1,
    // username=Donov,
    // comment=Does this change the database?, createdAt=2026-01-05T15:03:04.480)

    @Transactional
    public ratingsPageDTO createRatingsPage(recievedRatingsCommentDTO dto) {
        logger.info("service-calls", "", "RatingsPageService", "createRatingsPage");
        // 1. Find or initialize the page (ID is still null if new)
        RatingsPage page = ratingsRepo.findByDawId(dto.getDawId())
                .orElseGet(() -> {
                    RatingsPage newPage = new RatingsPage();
                    newPage.setDawId(dto.getDawId());
                    newPage.setRating(0.0);
                    newPage.setComments(new ArrayList<>());
                    return newPage;
                });
        RatingsPage savedPage = ratingsRepo.save(page);

        // 2. Create the Comment Entity (ID is null)
        RatingsComment newComment = new RatingsComment();
        newComment.setDawId(dto.getDawId());
        newComment.setRating(dto.getRating());
        newComment.setUserId(dto.getUserId());
        newComment.setUsername(dto.getUsername());
        newComment.setComment(dto.getComment());
        newComment.setCreatedAt(LocalDateTime.now());

        // 3. LINK BOTH SIDES (This is purely in-memory right now)
        newComment.setRatingsPage(savedPage);

        RatingsComment savedComment = this.commentRepo.save(newComment);
        savedPage.getComments().add(savedComment);

        // 4. Recalculate Average Score
        double newAvg = savedPage.getComments().stream()
                .mapToDouble(RatingsComment::getRating)
                .average()
                .orElse(0.0);
        savedPage.setRating(newAvg);

        System.out.println("After changing everything, these are the objects");
        System.out.println("The page itself: ");
        System.out.println(savedPage);
        System.out.println("The comment itself: ");
        System.out.println(savedComment);

        logger.trace("service-calls", "After changing everything, these are the objects", "RatingsPageService", "createRatingsPage");
        logger.trace("service-calls", "The page itself:", "RatingsPageService", "createRatingsPage");
        logger.trace("service-calls", savedPage.toString(), "RatingsPageService", "createRatingsPage");
        logger.trace("service-calls", "The comment itself:", "RatingsPageService", "createRatingsPage");
        logger.trace("service-calls", savedComment.toString(), "RatingsPageService", "createRatingsPage");

        // 5. THE CRITICAL CHANGE: Save the PAGE only.
        // DELETE 'commentRepo.save(newComment)' from before.
        // Hibernate will see the Page is new (or dirty), save it, get the ID,
        // and then save the comment with that ID automatically.
        RatingsPage finalSavedPage = ratingsRepo.save(savedPage);

        System.out.println("FIXED STATE: " + finalSavedPage);
        logger.trace("service-calls", "FIXED STATE: " + finalSavedPage, "RatingsPageService", "createRatingsPage");
        return convertToDTO(finalSavedPage);
    }

    private recievedRatingsCommentDTO mapCommentToDTO(RatingsComment comment) {
        recievedRatingsCommentDTO dto = new recievedRatingsCommentDTO();
        dto.setDawId(comment.getDawId());
        dto.setRating(comment.getRating());
        // Get the ID from the parent object if it exists
        dto.setRatingsPageId(comment.getRatingsPage() != null ? comment.getRatingsPage().getId() : null);
        dto.setUserId(comment.getUserId());
        dto.setUsername(comment.getUsername());
        dto.setComment(comment.getComment());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }

    private ratingsPageDTO convertToDTO(RatingsPage entity) {
        // Logic to transform entity list to DTO list...
        // (As discussed in our previous step)
        List<recievedRatingsCommentDTO> commentDtos = entity.getComments().stream()
                .map(this::mapCommentToDTO)
                .collect(Collectors.toList());

        return new ratingsPageDTO(entity.getId(), entity.getDawId(), entity.getRating(), commentDtos);
    }

    public ratingsPageDTO getRatingsPageByDawId(String dawId) {
        logger.info("service-calls", "", "RatingsPageService", "getRatingsPageByDawId");
        return convertToDTO(ratingsRepo.findByDawId(dawId)
                .orElseThrow(() -> new RatingsPageNotFoundException(
                        "Ratings page you are looking for could not be found in database")));
    }
}