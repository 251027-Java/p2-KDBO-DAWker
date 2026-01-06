package com.project.dawker.repository;

import com.project.dawker.entity.User;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User test;
    private User savedUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        test = new User();
        test.setUsername("john_doe");
        test.setEmail("john@example.com");
        test.setPassword("securepassword");
        test.setRole("USER");
        savedUser = userRepository.save(test);
    }

    @Test
    void findUserById_ReturnTrue() {
        Optional<User> retrievedUser = userRepository.findById(savedUser.getId());
        assertThat(retrievedUser).isPresent();
        assertThat(retrievedUser.get().getUsername()).isEqualTo("john_doe");
    }

    @Test
    void existsByUsername_ReturnTrue() {
        assertThat(userRepository.existsByUsername("john_doe")).isTrue();
        assertThat(userRepository.existsByUsername("NotFound")).isFalse();
    }

    @Test
    void findByEmailContainingIgnoreCase() {
        Optional<User> result = userRepository.findByEmailContainingIgnoreCase("example");
        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("john@example.com");
    }

    @Test
    void findByUsernameContainingIgnoreCase() {
        List<User> result = userRepository.findByUsernameContainingIgnoreCase("john");
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo("john_doe");
    }

    
}
