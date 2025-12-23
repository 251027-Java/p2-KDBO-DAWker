package com.project.dawker.repository;

import com.project.dawker.entity.GearItem;
import com.project.dawker.entity.GearType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// provides catalog of available equipment for frontend dropdown menus (right now im just thinking about doing a 
// couple of amps/pedals/cabinets not really factoring in the concept of dragging dropping gear items into the rack)
@Repository
public interface GearItemRepository extends JpaRepository<GearItem, Long> {

    // find all gear items of a specific type. used to filter the catalog by gear type (PEDAL, AMP, CABINET) for populating dropdown menus in the frontend rack interface
    List<GearItem> findByGearType(GearType gearType);

    // find a gear item by model name. used for validation and lookup operations
    java.util.Optional<GearItem> findByModelName(String modelName);

    // check if a gear item exists with the given model name
    boolean existsByModelName(String modelName);
}

