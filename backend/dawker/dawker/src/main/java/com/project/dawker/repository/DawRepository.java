package com.project.dawker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.dawker.entity.daw_specific.DawEntity;

@Repository
public interface DawRepository extends JpaRepository<DawEntity, String> {

    // Get just the names/IDs for a "My Projects" list

    // [
    // {
    // "id": "project-uuid-123",
    // "userId": 1,
    // "name": "Heavy Metal Rig",
    // "listOfConfigs": []
    // },
    // {
    // "id": "project-uuid-456",
    // "userId": 1,
    // "name": "Lofi Beats Setup",
    // "listOfConfigs": []
    // }
    // ]
    Optional<List<DawEntity>> findByUserId(Long userId);

    // Get the full rig with all pedals for the actual DAW editor
    // You MUST have one rig to return this. If 0, return nothing

    // {
    // "id": "project-1",
    // "listOfConfigs": [
    // { "name": "Dreamy Rig",
    // "componentChain": [
    // { "name": "Distortion", "settings": { "parameters": {...} } },
    // { "name": "Reverb", "settings": { "parameters": {...} } }
    // ]
    // }
    // ]
    // }
    @Query("SELECT d FROM DawEntity d " +
            "LEFT JOIN FETCH d.listOfConfigs c " +
            "LEFT JOIN FETCH c.componentChain comp " +
            "WHERE d.user.id = :userId")
    Optional<DawEntity> findFullRigForUser(@Param("userId") Long userId);
}