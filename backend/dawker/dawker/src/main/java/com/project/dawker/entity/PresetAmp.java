package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PresetAmp entity: Stores amp configuration for a preset
 * Matches frontend structure: distortionValue, bassValue, midValue, trebleValue, reverbValue, volumeValue
 */
@Entity
@Table(name = "preset_amp")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresetAmp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preset_id", nullable = false, unique = true)
    private Preset preset;

    @Column(nullable = false)
    private Double distortionValue = 0.4; // 0.0 to 1.0 (gain)

    @Column(nullable = false)
    private Double bassValue = 0.0; // -12.0 to 12.0 dB

    @Column(nullable = false)
    private Double midValue = 0.0; // -12.0 to 12.0 dB

    @Column(nullable = false)
    private Double trebleValue = 0.0; // -12.0 to 12.0 dB

    @Column(nullable = false)
    private Double reverbValue = 0.3; // 0.0 to 1.0 (wet/dry mix)

    @Column(nullable = false)
    private Double volumeValue = -6.0; // -60.0 to 0.0 dB
}

