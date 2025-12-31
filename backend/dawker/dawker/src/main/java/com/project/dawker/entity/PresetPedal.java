package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.*;

// preset pedal entity : stores pedal configuration for a preset
@Entity
@Table(name = "preset_pedal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PresetPedal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preset_id", nullable = false, unique = true)
    private Preset preset;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(nullable = false)
    private Double reverbMix = 0.8; // 0.0 to 1.0

    @Column(nullable = false)
    private Double reverbRoomSize = 0.9; // 0.1 to 1.0
}

