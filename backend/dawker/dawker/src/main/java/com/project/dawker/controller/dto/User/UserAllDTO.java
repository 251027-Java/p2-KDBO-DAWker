package com.project.dawker.controller.dto.User;

import com.project.dawker.controller.dto.Category.CategoryDTO;
import com.project.dawker.controller.dto.GearItem.GearItemDTO;
import com.project.dawker.controller.dto.Preset.PresetDTO;
import com.project.dawker.controller.dto.PresetCategory.PresetCategoryDTO;
import com.project.dawker.controller.dto.PresetGear.PresetGearDTO;

import java.util.Map;

// NOTE: as of right now, presetCategories will contain no useful information
//       I only included it just in case we decide to add useful information to it later
//       it would make it easier to implement the changes

public record UserAllDTO(
    UserDTO user,
    Map<Long, PresetDTO> presets, // presetID -> preset
    Map<Long, PresetGearDTO> presetGears, // presetGearID -> presetGear
    Map<Long, GearItemDTO> gearItems, // gearItemID -> gearItem
    Map<Long, PresetCategoryDTO> presetCategories, // presetCategoryID -> presetCategory
    Map<Long, CategoryDTO> categories // categoryID -> category
) {
}
