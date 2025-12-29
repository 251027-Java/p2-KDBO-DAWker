package com.project.dawker.entity.daw_specific;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Entity
public class ComponentEntity {
    @Id
    private String id;

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
