package com.project.dawker.repository;

import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dawker.entity.daw_specific.RatingsPage;

@Repository
public interface RatingsPageRepository extends JpaRepository<RatingsPage, Long> {

    Optional<RatingsPage> findByDawId(String dawId);
}