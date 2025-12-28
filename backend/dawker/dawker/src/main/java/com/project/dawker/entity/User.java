package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

// user entity : account info
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    // one to many with presets
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Preset> presets;

    public void addPreset(Preset preset) {
        presets.add(preset);
        preset.setUser(this);
    }

    public void removePreset(Preset preset) {
        presets.remove(preset);
    }
}

