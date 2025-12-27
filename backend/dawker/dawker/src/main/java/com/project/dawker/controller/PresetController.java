package com.project.dawker.controller;

import com.project.dawker.controller.dto.Preset.PresetDTO;
import com.project.dawker.service.PresetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presets")
public class PresetController {
    private final PresetService serv;

    public PresetController(PresetService presetService){
        serv = presetService;
    }

    @GetMapping(params = {"userId", "!name", "!categoryId"})
    public List<PresetDTO> findByUserId(@RequestParam Long userId){
        return serv.findByUserId(userId);
    }

    @GetMapping(params = {"userId", "name", "!categoryId"})
    public PresetDTO findByUserIdAndPresetName(@RequestParam Long userId, @RequestParam String name){
        return serv.findByUserIdAndPresetName(userId, name);
    }

    @GetMapping(params = {"!userId", "!name", "categoryId"})
    public List<PresetDTO> findByCategoryId(@RequestParam Long categoryId){
        return serv.findByCategoryId(categoryId);
    }

    @GetMapping(params = {"userId", "!name", "categoryId"})
    public List<PresetDTO> findByUserIdAndCategoryId(@RequestParam Long userId, @RequestParam Long categoryId){
        return serv.findByUserIdAndCategoryId(userId, categoryId);
    }
}
