package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

// acts like a container for the gear items, doesn't store the actual settings just name and created time
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

    // m:m with categories through preset category
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

