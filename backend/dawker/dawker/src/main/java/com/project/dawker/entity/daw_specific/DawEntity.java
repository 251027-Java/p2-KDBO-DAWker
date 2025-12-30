package com.project.dawker.entity.daw_specific;

import java.util.ArrayList;
import java.util.List;

import com.project.dawker.entity.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;

// [ 
// 	{ 
// 		"id": "project-uuid-123", 
// 		"userId": 1, 
// 		"name": "Heavy Metal Rig", 
// 		"listOfConfigs": [] 
// 	}, 
// 	{ 
// 		"id": "project-uuid-456", 
// 		"userId": 1, 
// 		"name": "Lofi Beats Setup", 
// 		"listOfConfigs": [] 
// 	} 
// ]

@Entity
@Data
public class DawEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;

    @OneToMany(mappedBy = "daw", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConfigEntity> listOfConfigs = new ArrayList<>();
}