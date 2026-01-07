package com.project.dawker.service;

import com.project.dawker.dto.ratingsPageDTO;
import com.project.dawker.dto.recievedDto.recievedRatingsCommentDTO;
import com.project.dawker.entity.daw_specific.RatingsComment;
import com.project.dawker.entity.daw_specific.RatingsPage;
import com.project.dawker.exception.RatingsPageNotFoundException;
import com.project.dawker.kafka.KafkaLogProducer;
import com.project.dawker.repository.RatingsCommentRepository;
import com.project.dawker.repository.RatingsPageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RatingsPageServiceTest {

    @Mock
    private RatingsCommentRepository commentRepository;

    @Mock
    private RatingsPageRepository ratingsPageRepository;

    @Mock
    private KafkaLogProducer logger;

    @InjectMocks
    private RatingsPageService ratingsPageService;

    private recievedRatingsCommentDTO inputDto;

    @BeforeEach
    void setUp() {
        inputDto = new recievedRatingsCommentDTO(
            "DAW-123",
            4.0,
            null,
            1L,
            "Donov",
            "Great preset!",
            LocalDateTime.now()
        );
    }

    @Test
    void createRatingsPage_createsNewPageAndCalculatesRating() {
        RatingsPage savedPage = new RatingsPage();
        savedPage.setId(1L);
        savedPage.setDawId("DAW-123");
        savedPage.setRating(0.0);
        savedPage.setComments(new ArrayList<>());

        when(ratingsPageRepository.findByDawId("DAW-123")).thenReturn(Optional.empty());

        when(ratingsPageRepository.save(any(RatingsPage.class))).thenAnswer(invocation -> {
            RatingsPage page = invocation.getArgument(0);
            page.setId(1L);
            return page;
        });

        when(commentRepository.save(any(RatingsComment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ratingsPageDTO result = ratingsPageService.createRatingsPage(inputDto);

        assertNotNull(result);
        assertEquals("DAW-123", result.getDawId());
        assertEquals(4.0, result.getRating());
        assertEquals(1, result.getComments().size());
        assertEquals("Donov", result.getComments().get(0).getUsername());
    }

    @Test
    void createRatingsPage_existingPage_updatesAverage() {
        RatingsComment existingComment = new RatingsComment();
        existingComment.setRating(2.0);

        RatingsPage existingPage = new RatingsPage();
        existingPage.setId(1L);
        existingPage.setDawId("DAW-123");
        existingPage.setComments(new ArrayList<>(List.of(existingComment)));
        existingPage.setRating(2.0);

        when(ratingsPageRepository.findByDawId("DAW-123")).thenReturn(Optional.of(existingPage));

        when(ratingsPageRepository.save(any(RatingsPage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        when(commentRepository.save(any(RatingsComment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ratingsPageDTO result = ratingsPageService.createRatingsPage(inputDto);

        assertEquals(3.0, result.getRating());
        assertEquals(2, result.getComments().size());
    }

    @Test
    void getRatingsPageByDawId_success() {
        RatingsPage page = new RatingsPage();
        page.setId(1L);
        page.setDawId("DAW-123");
        page.setRating(4.5);
        page.setComments(new ArrayList<>());

        when(ratingsPageRepository.findByDawId("DAW-123")).thenReturn(Optional.of(page));

        ratingsPageDTO result = ratingsPageService.getRatingsPageByDawId("DAW-123");

        assertEquals(1L, result.getId());
        assertEquals("DAW-123", result.getDawId());
        assertEquals(4.5, result.getRating());
    }

    @Test
    void getRatingsPageByDawId_notFound_throwsException() {
        when(ratingsPageRepository.findByDawId("INVALID")).thenReturn(Optional.empty());

        assertThrows(RatingsPageNotFoundException.class, () -> ratingsPageService.getRatingsPageByDawId("INVALID"));
    }
}
