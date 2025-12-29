package com.project.dawker.entity.daw_specific;

import java.util.HashMap;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;

@Entity
public class SettingsEntity {

    // Generate a new ID for each settings entity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String technology; // 'RNBO' | 'TONEJS'
    private String exportName;

    // Use a JSON column to store dynamic parameters
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "parameters")
    private Map<String, Object> parameters = new HashMap<>();
    // Note: We store values as Strings and cast them in the front-end to handle
    // mixed types
}