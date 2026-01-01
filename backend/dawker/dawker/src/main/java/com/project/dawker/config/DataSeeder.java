package com.project.dawker.config;

import com.project.dawker.service.DawService;
import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.ComponentEntity;
import com.project.dawker.entity.daw_specific.ConfigEntity;
import com.project.dawker.entity.daw_specific.DawEntity;
import com.project.dawker.entity.daw_specific.SettingsEntity;
import com.project.dawker.repository.DawRepository;
import com.project.dawker.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.project.dawker.service.DawService;

import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private final DawRepository dawRepository;
    private final UserRepository userRepository;

    public DataSeeder(DawRepository dawRepository, UserRepository userRepository) {
        this.dawRepository = dawRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional // Ensures all saves happen in one transaction
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0)
            return; // Don't seed if data exists

        // 1. Create a User
        User user = new User();
        user.setUsername("Donov");
        user.setEmail("Donovan@Gmail.com");
        user.setPassword("somePass");
        user.setRole("USER");
        userRepository.save(user);

        // 2. Create the Top-Level DAW project
        DawEntity project = new DawEntity();
        project.setName("Atmospheric Post-Rock Rig");
        project.setDescription(
                "A DAW setup for creating lush, atmospheric post-rock soundscapes with an emphasis on reverb and delay effects.");
        project.setUser(user);

        // 3. Create a Configuration (A specific Signal Chain)
        ConfigEntity mainChain = new ConfigEntity();
        mainChain.setName("Main Stereo Out");
        mainChain.setDaw(project); // Set Parent

        // 5. Create Settings for the Component
        SettingsEntity reverbSettings = new SettingsEntity();
        reverbSettings.setTechnology("RNBO");
        reverbSettings.setExportName("cloud_v1");

        // Populate the Map<String, Object> for the JSONB column
        reverbSettings.setParameters(Map.of(
                "decay", 0.85,
                "mix", 0.4,
                "shimmer", true,
                "color", "dark"));

        // 4. Create a Component (The Pedal)
        ComponentEntity reverb = new ComponentEntity();
        reverb.setInstanceId("rev-" + System.currentTimeMillis());
        reverb.setName("Cloud Reverb");
        reverb.setType("reverb");
        reverb.setConfig(mainChain); // Set Parent

        // 6. Link Settings to Component (One-to-One)
        reverb.setSettings(reverbSettings);

        // 7. Add Component to the Config's list
        mainChain.getComponents().add(reverb);

        // 8. Add Config to the DAW's list
        project.getListOfConfigs().add(mainChain);

        // 9. Final Save
        // Because CascadeType.ALL is on everything,
        // saving the project saves configs, components, and settings.
        dawRepository.save(project);

        System.out.println("--- Database Seeded with Initial DAW Project ---");
    }
}