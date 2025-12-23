package com.project.dawker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// represents the join table for the m:m relationship between presets and categories
// allows us to perform join queries to fetch all tags associated with a preset
@Entity
@Table(name = "preset_categories", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"preset_id", "category_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresetCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // many to one with preset
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preset_id", nullable = false)
    private Preset preset;

    // many to one with category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}

