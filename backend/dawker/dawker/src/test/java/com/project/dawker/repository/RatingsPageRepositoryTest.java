package com.project.dawker.repository;

import com.project.dawker.entity.daw_specific.DawEntity;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.RatingsPage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class RatingsPageRepositoryTest {

    @Autowired
    private RatingsPageRepository ratingsPageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DawRepository dawRepository;

    private User testUser;
    private User savedUser;
    private DawEntity testDaw;
    private DawEntity savedDaw;
    private RatingsPage testRatingsPage;
    private RatingsPage savedRatingsPage;

    @BeforeEach
    void setUp() {
        ratingsPageRepository.deleteAll();
        userRepository.deleteAll();
        dawRepository.deleteAll();

        testUser = new User();
        testUser.setUsername("john_doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("securepassword");
        testUser.setRole("USER");
        savedUser = userRepository.save(testUser);

        testDaw = new DawEntity();
        testDaw.setName("Test Daw");
        testDaw.setUser(savedUser);
        savedDaw = dawRepository.save(testDaw);

        testRatingsPage = new RatingsPage();
        testRatingsPage.setDawId(savedDaw.getId().toString());
        savedRatingsPage = ratingsPageRepository.save(testRatingsPage);
    }

    @Test
    void findByDawId_ReturnsRatingsPage() {
        Optional<RatingsPage> retrieved = ratingsPageRepository.findByDawId(savedDaw.getId().toString());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getId()).isEqualTo(savedRatingsPage.getId());
    }
}