package com.project.dawker.controller;

import com.project.dawker.controller.dto.PresetGear.PresetGearDTO;
import com.project.dawker.service.PresetGearService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/presetgears")
public class PresetGearController {
    private final PresetGearService serv;

    public PresetGearController(PresetGearService presetGearService){
        serv = presetGearService;
    }

    @GetMapping(params = {"presetId", "!gearItemId", "!type"})
    public List<PresetGearDTO> findByPresetId(@RequestParam Long presetId){
        return serv.findByPresetIdOrderByOrderIndexAsc(presetId);
    }

    @GetMapping(params = {"!presetId", "gearItemId", "!type"})
    public List<PresetGearDTO> findByGearItemId(@RequestParam Long gearItemId){
        return serv.findByGearItemId(gearItemId);
    }

    @GetMapping("/count")
    public long countByGearItemId(@RequestParam Long gearItemId){
        return serv.countByGearItemId(gearItemId);
    }

    @GetMapping(path = "/popular", params = {"!numMostPopular"})
    public Map<Long, Long> findMostPopularGearItems(){
        return serv.findMostPopularGearItems();
    }

    @GetMapping(path = "/popular", params = {"numMostPopular"})
    public Map<Long, Long> findMostPopularGearItems(@RequestParam int numMostPopular){
        return serv.findMostPopularGearItems(numMostPopular);
    }

    @GetMapping(params = {"!presetId", "!gearItemId", "type"})
    public List<PresetGearDTO> findByGearType(@RequestParam String type){
        return serv.findByGearType(type);
    }
}
