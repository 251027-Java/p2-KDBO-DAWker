package com.project.dawker.controller;

import com.project.dawker.controller.dto.GearItem.GearItemAllRespDTO;
import com.project.dawker.controller.dto.GearItem.GearItemRespDTO;
import com.project.dawker.service.GearItemService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gearitems")
public class GearItemController {
    private final GearItemService serv;

    public GearItemController(GearItemService gearItemService) {
        serv = gearItemService;
    }

    @GetMapping(params = {"type", "!modelName"})
    @ResponseStatus(HttpStatus.OK)
    public List<GearItemRespDTO> findByGearType(@RequestParam String type){
        return serv.findByGearType(type);
    }

    @GetMapping(params = {"modelName", "!type"})
    @ResponseStatus(HttpStatus.OK)
    public GearItemRespDTO findByModelName(@RequestParam String modelName){
        return serv.findByModelName(modelName);
    }

    @GetMapping("exists")
    @ResponseStatus(HttpStatus.OK)
    public boolean existsByModelName(@RequestParam String modelName){
        return serv.existsByModelName(modelName);
    }

    @GetMapping(path = "/all", params = {"type", "!modelName"})
    @ResponseStatus(HttpStatus.OK)
    public List<GearItemAllRespDTO> findByGearTypeAll(@RequestParam String type){
        return serv.findByGearTypeAll(type);
    }

    @GetMapping(path = "/all", params = {"modelName", "!type"})
    @ResponseStatus(HttpStatus.OK)
    public GearItemAllRespDTO findByModelNameAll(@RequestParam String modelName){
        return serv.findByModelNameAll(modelName);
    }
}
