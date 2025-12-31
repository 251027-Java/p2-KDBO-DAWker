package com.project.dawker.controller;

import com.project.dawker.controller.dto.GearItem.GearItemDTO;
import com.project.dawker.service.GearItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gearitems")
public class GearItemController {
    private final GearItemService serv;

    public GearItemController(GearItemService gearItemService) {
        serv = gearItemService;
    }

    @GetMapping(params = {"id", "!type", "!modelName"})
    public GearItemDTO findById(@RequestParam Long id){
        return serv.findById(id);
    }

    @GetMapping(params = {"!id", "type", "!modelName"})
    public List<GearItemDTO> findByGearType(@RequestParam String type){
        return serv.findByGearType(type);
    }

    @GetMapping(params = {"!id", "modelName", "!type"})
    public GearItemDTO findByModelName(@RequestParam String modelName){
        return serv.findByModelName(modelName);
    }

    @GetMapping("/exists")
    public boolean existsByModelName(@RequestParam String modelName){
        return serv.existsByModelName(modelName);
    }
}
