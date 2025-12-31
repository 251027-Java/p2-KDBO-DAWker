package com.project.dawker.controller;

import com.project.dawker.controller.dto.Preset.PresetDTO;
import com.project.dawker.controller.dto.Preset.PresetWOIDDTO;
import com.project.dawker.service.PresetService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presets")
public class PresetController {
    private final PresetService serv;

    public PresetController(PresetService presetService) {
        serv = presetService;
    }

    @GetMapping(params = { "id", "!userId", "!name", "!categoryId" })
    public PresetDTO findById(@RequestParam Long id) {
        return serv.findById(id);
    }

    @GetMapping(params = { "!id", "userId", "!name", "!categoryId" })
    public List<PresetDTO> findByUserId(@RequestParam Long userId) {
        return serv.findByUserId(userId);
    }

    @GetMapping(params = { "!id", "userId", "name", "!categoryId" })
    public PresetDTO findByUserIdAndPresetName(@RequestParam Long userId, @RequestParam String name) {
        return serv.findByUserIdAndPresetName(userId, name);
    }

    @GetMapping(params = { "!id", "!userId", "!name", "categoryId" })
    public List<PresetDTO> findByCategoryId(@RequestParam Long categoryId) {
        return serv.findByCategoryId(categoryId);
    }

    @GetMapping(params = { "!id", "userId", "!name", "categoryId" })
    public List<PresetDTO> findByUserIdAndCategoryId(@RequestParam Long userId, @RequestParam Long categoryId) {
        return serv.findByUserIdAndCategoryId(userId, categoryId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PresetDTO createPreset(@RequestBody PresetWOIDDTO dto) {
        return serv.createPreset(dto);
    }

    @PutMapping
    public PresetDTO updatePreset(@RequestParam Long id, @RequestBody PresetWOIDDTO dto) {
        return serv.updatePreset(id, dto);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePreset(@RequestParam Long id) {
        serv.deletePreset(id);
    }
}
