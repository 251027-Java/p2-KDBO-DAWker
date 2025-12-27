package com.project.dawker.service;

import com.project.dawker.controller.dto.GearItem.GearItemDTO;
import com.project.dawker.entity.GearItem;
import com.project.dawker.entity.GearType;
import com.project.dawker.entity.PresetGear;
import com.project.dawker.exception.GearItemNotFoundException;
import com.project.dawker.exception.GearTypeNotFoundException;
import com.project.dawker.repository.GearItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GearItemService {
    private final GearItemRepository repo;

    public GearItemService(GearItemRepository gearItemRepository){
        repo = gearItemRepository;
    }

    public GearItemDTO findById(Long id){
        return gearItemToRespDTO(repo.findById(id).orElseThrow(() -> new GearItemNotFoundException(
            String.format("Gear Item ID = %d not found.", id))));
    }

    public List<GearItemDTO> findByGearType(String gearType){
        GearType type;

        try {
            type = GearType.valueOf(gearType);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new GearTypeNotFoundException(
                String.format("Gear Type = %s not found.", gearType));
        }

        return findByGearType(type);
    }
    public List<GearItemDTO> findByGearType(GearType gearType){
        return repo.findByGearType(gearType).stream().map(this::gearItemToRespDTO).toList();
    }

    public GearItemDTO findByModelName(String modelName){
        return gearItemToRespDTO(repo.findByModelName(modelName).orElseThrow(() -> new GearItemNotFoundException(
            String.format("Gear Item Model Name = %s not found.", modelName))));
    }

    public boolean existsByModelName(String modelName){
        return repo.existsByModelName(modelName);
    }

    private GearItemDTO gearItemToRespDTO(GearItem item){
        return new GearItemDTO(item.getId(), item.getModelName(), item.getGearType().toString(),
            item.getPresetGears().stream().map(PresetGear::getId).toList());
    }
}
