package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

// acts like a container for the gear items, doesn't store the actual settings just name and created time
@Entity
@Table(name = "presets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Preset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String presetName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // m:m with gear items through preset gear
    @OneToMany(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PresetGear> presetGears;

    // m:m with categories through preset category
    @OneToMany(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PresetCategory> presetCategories;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

