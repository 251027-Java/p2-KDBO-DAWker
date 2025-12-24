package com.project.dawker.service;

import com.project.dawker.controller.dto.GearItem.GearItemRespDTO;
import com.project.dawker.entity.GearItem;
import com.project.dawker.entity.GearType;
import com.project.dawker.exception.CategoryTypeNotFoundException;
import com.project.dawker.exception.GearItemModelNameNotFoundException;
import com.project.dawker.repository.GearItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GearItemService {
    private final GearItemRepository repo;

    public GearItemService(GearItemRepository gearItemRepository){
        repo = gearItemRepository;
    }

    public List<GearItemRespDTO> findByGearType(String gearType){
        GearType type;

        try {
            type = GearType.valueOf(gearType);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new CategoryTypeNotFoundException(
                String.format("Gear Type = %s not found.", gearType));
        }

        return findByGearType(type);
    }
    public List<GearItemRespDTO> findByGearType(GearType gearType){
        return repo.findByGearType(gearType).stream().map(this::gearItemToRespDTO).toList();
    }

    public GearItemRespDTO findByModelName(String modelName){
        return gearItemToRespDTO(repo.findByModelName(modelName).orElseThrow(() -> new GearItemModelNameNotFoundException(
            String.format("Gear Item Model Name = %s not found.", modelName))));
    }

    public boolean existsByModelName(String modelName){
        return repo.existsByModelName(modelName);
    }

    private GearItemRespDTO gearItemToRespDTO(GearItem item){
        return new GearItemRespDTO(item.getId(), item.getModelName(), item.getGearType().toString());
    }
}
