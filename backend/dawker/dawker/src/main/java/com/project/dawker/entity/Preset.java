package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

// preset entity : container for a complete guitar rig configuration
// this may change in the future for a different m:m connection
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

    // One-to-One relationships with gear components (matches frontend structure)
    @OneToOne(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PresetPedal presetPedal;

    @OneToOne(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PresetAmp presetAmp;

    @OneToOne(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PresetCabinet presetCabinet;

    // m:m with categories through preset category (fulfills M:M requirement)
    @OneToMany(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PresetCategory> presetCategories;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

