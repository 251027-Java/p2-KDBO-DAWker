package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

// preset entity : container for a complete guitar rig configuration
// this may change in the future for a different m:m connection
@Entity
@Table(name = "presets", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "presetName"})
})
@Getter
@Setter
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
    @OneToMany(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<PresetGear> presetGears;

    // One-to-One relationships with gear components (matches frontend structure)
    @OneToOne(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PresetPedal presetPedal;

    @OneToOne(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PresetAmp presetAmp;

    @OneToOne(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PresetCabinet presetCabinet;

    // m:m with categories through preset category (fulfills M:M requirement)
    @OneToMany(mappedBy = "preset", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<PresetCategory> presetCategories;

    public Preset(Long newId, User newUser, String name, List<PresetGear> newPresetGears, List<PresetCategory> newPresetCategories){
        id = newId;
        user = newUser;
        presetName = name;
        presetGears = newPresetGears;
        presetCategories = newPresetCategories;
    }

    public void addPresetGear(PresetGear pg) {
        presetGears.add(pg);
        pg.setPreset(this);
    }

    public void removePresetGear(PresetGear pg) {
        presetGears.remove(pg);
    }

    public void addPresetCategory(PresetCategory pc) {
        presetCategories.add(pc);
        pc.setPreset(this);
    }

    public void removePresetCategory(PresetCategory pc) {
        presetCategories.remove(pc);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

