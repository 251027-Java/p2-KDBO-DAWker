package com.project.dawker.repository;

import com.project.dawker.entity.daw_specific.ConfigEntity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class ConfigRepositoryTest {

    @Autowired
    private ConfigRepository configRepository;

    @Test
    void findById_ReturnTrue() {
        ConfigEntity testConfig = new ConfigEntity();
        testConfig.setName("testConfig");
        ConfigEntity savedConfig = configRepository.save(testConfig);

        Optional<ConfigEntity> retrievedConfig = configRepository.findById(savedConfig.getId());
        assertThat(retrievedConfig).isPresent();
        assertThat(retrievedConfig.get().getName()).isEqualTo("testConfig");
    }
}