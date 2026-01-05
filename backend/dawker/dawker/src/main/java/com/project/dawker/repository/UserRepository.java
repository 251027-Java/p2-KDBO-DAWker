package com.project.dawker.repository;

import com.project.dawker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findById(Long Id);

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findByEmailContainingIgnoreCase(String email);

    List<User> findByUsernameContainingIgnoreCase(String search);
}
