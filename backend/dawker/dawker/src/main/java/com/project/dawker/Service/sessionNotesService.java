package com.project.dawker.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.project.dawker.dto.recievedDto.recievedSessionNotesDTO;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.sessionNotes;
import com.project.dawker.repository.SessionNotesRepository;
import com.project.dawker.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class sessionNotesService {
    private final UserRepository userRepo;
    private final SessionNotesRepository notesRepo;

    public sessionNotesService(UserRepository userRepo, SessionNotesRepository notesRepo) {
        this.userRepo = userRepo;
        this.notesRepo = notesRepo;
    }

    // Inside SessionNotesService.java

    private recievedSessionNotesDTO mapToDTO(sessionNotes entity) {
        if (entity == null)
            return null;

        return new recievedSessionNotesDTO(
                entity.getId(),
                entity.getAuthor() != null ? entity.getAuthor().getId() : null,
                entity.getTitle(),
                entity.getContent());
    }

    private sessionNotes mapToEntity(recievedSessionNotesDTO dto, User user) {
        if (dto == null)
            return null;

        sessionNotes entity = new sessionNotes();
        entity.setId(dto.getId()); // Will be null for new notes
        entity.setTitle(dto.getTitle());
        entity.setContent(dto.getContent());
        entity.setAuthor(user);

        return entity;
    }

    public recievedSessionNotesDTO getNoteById(Long id) {
        sessionNotes note = notesRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Note_Entry not found with ID: " + id));
        return mapToDTO(note);
    }

    public List<recievedSessionNotesDTO> getAllNoteByUserId(Long id) {
        List<recievedSessionNotesDTO> notes = notesRepo.findAllByAuthor_Id(id).stream()
                .map(this::mapToDTO).toList();
        return notes;
    }

    @Transactional
    public recievedSessionNotesDTO saveOrUpdateNote(recievedSessionNotesDTO dto) {
        // 1. Find the user (assuming you have a userRepository injected)
        User user = userRepo.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        sessionNotes noteEntity;
        sessionNotes savedNote;

        if (dto.getId() != null) {
            // 2. Update existing note
            noteEntity = notesRepo.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Note not found"));
            noteEntity.setTitle(dto.getTitle());
            noteEntity.setContent(dto.getContent());

            // 4. Save (Cascade on User or direct Save on Note)
            savedNote = notesRepo.save(noteEntity);
        } else {
            // 3. Create new note and link to user
            noteEntity = mapToEntity(dto, user);

            // Make sure the new Note is saved
            // 4. Save (Cascade on User or direct Save on Note)
            savedNote = notesRepo.save(noteEntity);

            // Ensure the bidirectional link is established
            if (user.getNotes() == null) {
                user.setNotes(new ArrayList<>());
            }

            // Save the made note within the user Repo to be regained lated
            user.getNotes().add(savedNote);
            userRepo.save(user);
        }

        return mapToDTO(savedNote);
    }
}
