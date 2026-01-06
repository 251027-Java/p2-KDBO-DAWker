package com.project.dawker.repository;

import com.project.dawker.entity.User;

import org.junit.jupiter.api.DisplayName;
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

    @Test
    @DisplayName("Should save and retrieve a user")
    void testSaveAndFindUser() {
        // Arrange
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setRole("USER");

        // Act
        User savedUser = userRepository.save(user);
        Optional<User> retrievedUser = userRepository.findById(savedUser.getId());

        // Assert
        assertThat(retrievedUser).isPresent();
        assertThat(retrievedUser.get().getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Should find users by username containing")
    void testFindByUsernameContainingIgnoreCase() {
        User user1 = new User();
        user1.setUsername("Alice");
        user1.setEmail("alice@example.com");
        user1.setPassword("pass");
        user1.setRole("USER");

        User user2 = new User();
        user2.setUsername("Bob");
        user2.setEmail("bob@example.com");
        user2.setPassword("pass");
        user2.setRole("USER");

        userRepository.save(user1);
        userRepository.save(user2);

        List<User> result = userRepository.findByUsernameContainingIgnoreCase("ali");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo("Alice");
    }

    @Test
    @DisplayName("Should check if username exists")
    void testExistsByUsername() {
        User user = new User();
        user.setUsername("Charlie");
        user.setEmail("charlie@example.com");
        user.setPassword("pass");
        user.setRole("USER");

        userRepository.save(user);

        assertThat(userRepository.existsByUsername("Charlie")).isTrue();
        assertThat(userRepository.existsByUsername("NotFound")).isFalse();
    }
}
