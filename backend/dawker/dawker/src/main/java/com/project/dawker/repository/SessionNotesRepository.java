package com.project.dawker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dawker.entity.daw_specific.sessionNotes;

@Repository
public interface SessionNotesRepository extends JpaRepository<sessionNotes, Long> {

    Optional<sessionNotes> findById(Long Id);

    List<sessionNotes> findAllByAuthor_Id(Long userId);
}
