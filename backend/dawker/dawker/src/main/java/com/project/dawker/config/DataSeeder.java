package com.project.dawker.config;

import com.project.dawker.entity.User;
import com.project.dawker.entity.daw_specific.Comment;
import com.project.dawker.entity.daw_specific.ComponentEntity;
import com.project.dawker.entity.daw_specific.ConfigEntity;
import com.project.dawker.entity.daw_specific.DawEntity;
import com.project.dawker.entity.daw_specific.ForumPost;
import com.project.dawker.entity.daw_specific.SettingsEntity;
import com.project.dawker.repository.CommentRepository;
import com.project.dawker.repository.DawRepository;
import com.project.dawker.repository.ForumPostRepository;
import com.project.dawker.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ForumPostRepository forumRepo;

    private final DawRepository dawRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public DataSeeder(DawRepository dawRepository, UserRepository userRepository, CommentRepository commentRepository) {
        this.dawRepository = dawRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
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

        // ----------Forum seeding---------------

        // 1. Create a Seed User first
        User admin = new User();
        admin.setUsername("AudioEngine99");
        admin.setEmail("engine99@dawker.io");
        admin.setPassword("hashed_pass"); // In a real app, use BCrypt
        admin.setRole("Admin");
        userRepository.save(admin);

        // 2. Seed Forum Post 1: Technical Help
        ForumPost post1 = new ForumPost();
        post1.setTitle("NAM Node Latency in Chrome");
        post1.setDescription(
                "I am noticing a slight delay when using the Neural Amp Model node on MacOS. Is anyone else seeing this?");
        post1.setPostType("HELP");
        post1.setAuthor(admin);
        post1.setTags(List.of("WASM", "LATENCY", "NAM"));

        // Save the post first so it has an ID
        forumRepo.save(post1);

        // 3. Seed Comments for Post 1
        Comment comment1 = new Comment();
        comment1.setContent("Have you tried increasing the buffer size in the DAWker settings?");
        comment1.setAuthor(admin); // Using admin as a commenter too
        comment1.setParentPost(post1); // Linking it to our post
        comment1.setCreatedAt(LocalDateTime.now().minusHours(2));
        commentRepository.save(comment1);

        Comment comment2 = new Comment();
        comment2.setContent("I fixed this by disabling hardware acceleration in Chrome!");
        comment2.setAuthor(admin);
        comment2.setParentPost(post1);
        comment2.setCreatedAt(LocalDateTime.now().minusMinutes(30));
        commentRepository.save(comment2);

        // 3. Seed Forum Post 2: Conversation/Showcase
        ForumPost post2 = new ForumPost();
        post2.setTitle("Check out my Neon Valley preset!");
        post2.setDescription("Just finished a synthwave patch using the DAWker FM-Synth. Link in profile.");
        post2.setPostType("CONVERSATION");
        post2.setAuthor(admin);
        post2.setTags(List.of("SYNTHWAVE", "PRESETS", "SHOWCASE"));
        forumRepo.save(post2);

        // 4. Seed Forum Post 3: Collaboration
        ForumPost post3 = new ForumPost();
        post3.setTitle("Looking for a Vocalist for Liquid DnB");
        post3.setDescription("I have the track ready in a DAWker project. Hit me up if you want to record some stems.");
        post3.setPostType("COLLAB");
        post3.setAuthor(admin);
        post3.setTags(List.of("DNB", "VOCALS", "COLLAB"));
        forumRepo.save(post3);

        System.out.println("--- DAWker Forum Seeds Planted ---");
    }
}