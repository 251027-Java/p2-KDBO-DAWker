package com.project.dawker.repository;

import com.project.dawker.entity.GearItem;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.PresetGear;
import com.project.dawker.repository.dto.GearItemUsageDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PresetGearRepository extends JpaRepository<PresetGear, Long> {

    List<PresetGear> findByPreset(Preset preset);

    // find all preset gear entries for specific preset, order it by the order index.
    List<PresetGear> findByPresetIdOrderByOrderIndexAsc(Long presetId);

    // find all preset gear entries for specific gear item
    // in the service you could use it to find all presets using a specific gear model
    List<PresetGear> findByGearItem(GearItem gearItem);

    /**
     * Count how many times a specific gear item is used across all presets.
     * Used by Analytics Service to determine the most popular gear models.
     *
     * @param gearItemId the ID of the gear item
     * @return count of how many presets use this gear item
     */

    // count times a gear item is used across all presets
    // could determine the most popular gear models (maybe we can cut this one out depending on if we want to do this in the service)
    long countByGearItemId(Long gearItemId);

    // find most popular gear items by usage count
    // use this alongside countByGearItemId
    // uses pageable to limit results (like we could do top 10 most popular amps used etc.)
    // this and countByGearItemId could be cut if we don't end up adding a lot of amps/pedals/cabinets to the system and just focus on one or two
    @Query("SELECT new com.project.dawker.repository.dto.GearItemUsageDTO(pg.gearItem.id, COUNT(pg)) " +
        "FROM PresetGear pg " +
        "GROUP BY pg.gearItem.id " +
        "ORDER BY COUNT(pg) DESC")
    List<GearItemUsageDTO> findMostPopularGearItems(Pageable pageable);

    // find all PresetGear entries for a specific gear type
    @Query("SELECT pg FROM PresetGear pg WHERE pg.gearItem.gearType = :gearType")
    List<PresetGear> findByGearType(@Param("gearType") com.project.dawker.entity.GearType gearType);
}

