package com.project.dawker.repository;

import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.DawEntity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class DawRepositoryTest {
    
    @Autowired
    private DawRepository dawRepository;
    @Autowired
    private UserRepository userRepository;

    private DawEntity testDaw;
    private User testUser;
    private User savedUser;

    @BeforeEach
    void setUp() {
        dawRepository.deleteAll();
        userRepository.deleteAll();
        testUser = new User();
        testUser.setUsername("john_doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("securepassword");
        testUser.setRole("USER");
        savedUser = userRepository.save(testUser);
        testDaw = new DawEntity();
        testDaw.setName("Test Daw");
        testDaw.setUser(savedUser);
        dawRepository.save(testDaw);
    }

    @Test
    void findByUserId_ReturnTrue() {
        Optional<java.util.List<DawEntity>> retrievedDaws = dawRepository.findByUserId(savedUser.getId());
        assertThat(retrievedDaws).isPresent();
        assertThat(retrievedDaws.get().get(0).getName()).isEqualTo("Test Daw");
    }

    @Test
    void findFullRigForUser_ReturnTrue() {
        Optional<DawEntity> retrievedDaw = dawRepository.findFullRigForUser(savedUser.getId());
        assertThat(retrievedDaw).isPresent();
        assertThat(retrievedDaw.get().getName()).isEqualTo("Test Daw");
    }
}
