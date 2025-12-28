package com.project.dawker.service;

import com.project.dawker.controller.dto.PresetGear.PresetGearDTO;
import com.project.dawker.controller.dto.PresetGear.PresetGearWOIDDTO;
import com.project.dawker.entity.GearItem;
import com.project.dawker.entity.GearType;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.PresetGear;
import com.project.dawker.exception.*;
import com.project.dawker.repository.GearItemRepository;
import com.project.dawker.repository.PresetGearRepository;
import com.project.dawker.repository.PresetRepository;
import com.project.dawker.repository.dto.GearItemUsageDTO;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class PresetGearService {
    private final static int DEFAULT_NUM_MOST_POPULAR_GEAR_ITEMS = 10;

    private final PresetGearRepository repo;
    private final PresetRepository pRepo;
    private final GearItemRepository gRepo;

    public PresetGearService(PresetGearRepository presetGearRepository, PresetRepository presetRepository, GearItemRepository gearItemRepository){
        repo = presetGearRepository;
        pRepo = presetRepository;
        gRepo = gearItemRepository;
    }

    public PresetGearDTO findById(Long id){
        return presetGearToDTO(repo.findById(id).orElseThrow(() -> new PresetGearNotFoundException(
            String.format("Preset Gear ID = %d not found.", id))));
    }

    public List<PresetGearDTO> findByPresetIdOrderByOrderIndexAsc(Long presetId){
        return repo.findByPresetIdOrderByOrderIndexAsc(presetId).stream().map(this::presetGearToDTO).toList();
    }

    public List<PresetGearDTO> findByGearItemId(Long gearItemId){
        return repo.findByGearItemId(gearItemId).stream().map(this::presetGearToDTO).toList();
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

    public List<PresetGearDTO> findByGearType(String gearType){
        GearType type;

        try {
            type = GearType.valueOf(gearType);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new CategoryTypeNotFoundException(
                String.format("Gear Type = %s not found.", gearType));
        }

        return findByGearType(type);
    }
    public List<PresetGearDTO> findByGearType(GearType gearType){
        return repo.findByGearType(gearType).stream().map(this::presetGearToDTO).toList();
    }

    public PresetGearDTO createPresetGear(PresetGearWOIDDTO dto) {
        Long pId = dto.presetId();
        Long gId = dto.gearItemId();
        Preset preset = pRepo.findById(pId).orElseThrow(() -> new PresetNotFoundException(
            String.format("Preset ID = %d not found.", pId)));
        GearItem gearItem = gRepo.findById(gId).orElseThrow(() -> new GearItemNotFoundException(
            String.format("Gear Item ID = %d not found.", gId)));

        PresetGear pg = new PresetGear();
        pg.setGainValue(dto.gainValue());
        pg.setToneValue(dto.toneValue());
        pg.setOrderIndex(dto.orderIndex());

        preset.addPresetGear(pg);
        gearItem.addPresetGear(pg);

        return presetGearToDTO(pg);
    }

    public PresetGearDTO updatePresetGear(Long id, PresetGearWOIDDTO dto) {
        PresetGear pg = repo.findById(id).orElseThrow(() -> new PresetGearNotFoundException(
            String.format("Preset Gear ID = %d not found.", id)));
        pg.setGainValue(dto.gainValue());
        pg.setToneValue(dto.toneValue());
        pg.setOrderIndex(dto.orderIndex());
        return presetGearToDTO(pg);
    }

    public void deletePresetGear(Long id) {
        PresetGear pg = repo.findById(id).orElseThrow(() -> new PresetGearNotFoundException(
            String.format("Preset Gear ID = %d not found.", id)));
        pg.getPreset().removePresetGear(pg);
        pg.getGearItem().removePresetGear(pg);
    }

    private PresetGearDTO presetGearToDTO(PresetGear presetGear){
        return new PresetGearDTO(presetGear.getId(), presetGear.getPreset().getId(), presetGear.getGearItem().getId(),
            presetGear.getGainValue(), presetGear.getToneValue(), presetGear.getOrderIndex());
    }
}
