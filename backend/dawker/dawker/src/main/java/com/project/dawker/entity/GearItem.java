package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// gear item entity : catalog of available equipment, kind of like a catalog for the gear items
// would be used as like a read only list for the frontend to populate the dropdown menus for the gear items
@Entity
@Table(name = "gear_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GearItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String modelName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GearType gearType;

    // m:m with presets through preset gear
    @OneToMany(mappedBy = "gearItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PresetGear> presetGears;
}

