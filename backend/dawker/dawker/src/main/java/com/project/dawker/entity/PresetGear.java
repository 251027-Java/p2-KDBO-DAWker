package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// preset gear entity : stores specific "knob" settings: gain_value, tone_value, order_index
// represents the join table for the m:m relationship between presets and gear items
@Entity
@Table(name = "preset_gear")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresetGear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // many to one with preset
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preset_id", nullable = false)
    private Preset preset;

    // many to one with gear item
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gear_item_id", nullable = false)
    private GearItem gearItem;

    // specific knob settings for this gear instance
    @Column(name = "gain_value")
    private Double gainValue;

    @Column(name = "tone_value")
    private Double toneValue;

    @Column(nullable = false)
    private Integer orderIndex; // determines the order of the gear item in the signal chain (like having the guitar rack ordered tuner, pedal, amp, cabinet)
}

