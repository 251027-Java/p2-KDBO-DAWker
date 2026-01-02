package com.project.dawker.entity.daw_specific;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.Data;

// CORRECT ENTITIES FOLDER PRANAV!!!!
@Entity
@Data
public class ComponentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String instanceId; // From React Date.now()
    private String name;
    private String type;

    @ManyToOne
    @JoinColumn(name = "config_id")
    private ConfigEntity config;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "settings_id", referencedColumnName = "id")
    private SettingsEntity settings;
}
