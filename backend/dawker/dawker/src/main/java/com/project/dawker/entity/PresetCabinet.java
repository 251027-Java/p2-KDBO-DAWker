package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * PresetCabinet entity: Stores cabinet configuration for a preset
 * Matches frontend structure: enabled, cabinetLowCut, cabinetHighCut, cabinetPresence
 */
@Entity
@Table(name = "preset_cabinet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PresetCabinet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preset_id", nullable = false, unique = true)
    private Preset preset;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(nullable = false)
    private Integer cabinetLowCut = 80; // 20 to 200 Hz

    @Column(nullable = false)
    private Integer cabinetHighCut = 8000; // 2000 to 20000 Hz

    @Column(nullable = false)
    private Double cabinetPresence = 0.0; // -12.0 to 12.0 dB
}

