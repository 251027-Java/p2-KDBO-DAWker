package com.project.dawker.controller.dto.User;

import com.project.dawker.controller.dto.Category.CategoryRespDTO;
import com.project.dawker.controller.dto.GearItem.GearItemRespDTO;
import com.project.dawker.controller.dto.Preset.PresetRespDTO;
import com.project.dawker.controller.dto.PresetCategory.PresetCategoryRespDTO;
import com.project.dawker.controller.dto.PresetGear.PresetGearRespDTO;

import java.util.Map;

// NOTE: as of right now, presetCategories will contain no useful information
//       I only included it just in case we decide to add useful information to it later
//       it would make it easier to implement the changes

public record UserRespAllDTO(
    UserRespDTO user,
    Map<Long, PresetRespDTO> presets, // presetID -> preset
    Map<Long, PresetGearRespDTO> presetGears, // presetGearID -> presetGear
    Map<Long, GearItemRespDTO> gearItems, // gearItemID -> gearItem
    Map<Long, PresetCategoryRespDTO> presetCategories, // presetCategoryID -> presetCategory
    Map<Long, CategoryRespDTO> categories // categoryID -> category
) {
}
