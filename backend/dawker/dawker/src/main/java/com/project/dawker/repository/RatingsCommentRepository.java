package com.project.dawker.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dawker.entity.daw_specific.RatingsComment;

@Repository
public interface RatingsCommentRepository extends JpaRepository<RatingsComment, Long> {

    Optional<RatingsComment> findByUserIdAndDawId(Long userId, Long dawId);

    Optional<RatingsComment> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}