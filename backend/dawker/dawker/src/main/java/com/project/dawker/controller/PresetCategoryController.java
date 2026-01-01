package com.project.dawker.controller;

import com.project.dawker.controller.dto.PresetCategory.PresetCategoryDTO;
import com.project.dawker.controller.dto.PresetCategory.PresetCategoryWOIDDTO;
import com.project.dawker.service.PresetCategoryService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presetcategories")
public class PresetCategoryController {
    private final PresetCategoryService serv;

    public PresetCategoryController(PresetCategoryService presetCategoryService) {
        serv = presetCategoryService;
    }

    // @GetMapping(params = { "id", "!presetId", "!categoryId" })
    // public PresetCategoryDTO findById(@RequestParam Long id) {
    // return serv.findById(id);
    // }

    // @GetMapping(params = { "!id", "presetId", "!categoryId" })
    // public List<PresetCategoryDTO> findByPresetId(@RequestParam Long presetId) {
    // return serv.findByPresetId(presetId);
    // }

    @GetMapping(params = { "!id", "!presetId", "categoryId" })
    public List<PresetCategoryDTO> findByCategoryId(@RequestParam Long categoryId) {
        return serv.findByCategoryId(categoryId);
    }

    @GetMapping("/exists")
    public boolean existsByPresetIdAndCategoryId(@RequestParam Long presetId, @RequestParam Long categoryId) {
        return serv.existsByPresetIdAndCategoryId(presetId, categoryId);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteByPresetId(@RequestParam Long presetId) {
        serv.deleteByPresetId(presetId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PresetCategoryDTO createPresetCategory(@RequestBody PresetCategoryWOIDDTO dto) {
        return serv.createPresetCategory(dto);
    }

    @PutMapping
    public PresetCategoryDTO updatePresetCategory(@RequestParam Long id, @RequestBody PresetCategoryWOIDDTO dto) {
        return serv.updatePresetCategory(id, dto);
    }

    // @DeleteMapping
    // @ResponseStatus(HttpStatus.NO_CONTENT)
    // public void deletePresetCategory(@RequestParam Long id) {
    // serv.deletePresetCategory(id);
    // }
}
