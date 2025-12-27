package com.project.dawker.service;

import com.project.dawker.controller.dto.PresetGear.PresetGearRespDTO;
import com.project.dawker.entity.GearType;
import com.project.dawker.entity.PresetGear;
import com.project.dawker.exception.CategoryTypeNotFoundException;
import com.project.dawker.exception.NonPositiveNumberException;
import com.project.dawker.repository.PresetGearRepository;
import com.project.dawker.repository.dto.GearItemUsageDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PresetGearService {
    private final static int DEFAULT_NUM_MOST_POPULAR_GEAR_ITEMS = 10;

    private final PresetGearRepository repo;

    public PresetGearService(PresetGearRepository presetGearRepository){
        repo = presetGearRepository;
    }

    public List<PresetGearRespDTO> findByPresetIdOrderByOrderIndexAsc(Long presetId){
        return repo.findByPresetIdOrderByOrderIndexAsc(presetId).stream().map(this::presetGearToRespDTO).toList();
    }

    public List<PresetGearRespDTO> findByGearItemId(Long gearItemId){
        return repo.findByGearItemId(gearItemId).stream().map(this::presetGearToRespDTO).toList();
    }

    public long countByGearItemId(Long gearItemId){
        return repo.countByGearItemId(gearItemId);
    }

    public Map<Long, Long> findMostPopularGearItems(){
        return findMostPopularGearItems(DEFAULT_NUM_MOST_POPULAR_GEAR_ITEMS);
    }
    public Map<Long, Long> findMostPopularGearItems(int numMostPopular){
        if (numMostPopular <= 0) throw new NonPositiveNumberException(
            String.format("Nonpositive number = %d given. Enter an integer greater than 0.", numMostPopular));

        return repo.findMostPopularGearItems(Pageable.ofSize(numMostPopular)).stream()
            .collect(Collectors.toMap(
                GearItemUsageDTO::gearItemId,
                GearItemUsageDTO::usageCount,
                Long::max, // this is only here because syntax requires a merge function. keys will be unique, so this will never be used
                LinkedHashMap::new
            ));
    }

    public List<PresetGearRespDTO> findByGearType(String gearType){
        GearType type;

        try {
            type = GearType.valueOf(gearType);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new CategoryTypeNotFoundException(
                String.format("Gear Type = %s not found.", gearType));
        }

        return findByGearType(type);
    }
    public List<PresetGearRespDTO> findByGearType(GearType gearType){
        return repo.findByGearType(gearType).stream().map(this::presetGearToRespDTO).toList();
    }

    private PresetGearRespDTO presetGearToRespDTO(PresetGear presetGear){
        return new PresetGearRespDTO(presetGear.getId(), presetGear.getPreset().getId(), presetGear.getGearItem().getId(),
            presetGear.getGainValue(), presetGear.getToneValue(), presetGear.getOrderIndex());
    }
}
