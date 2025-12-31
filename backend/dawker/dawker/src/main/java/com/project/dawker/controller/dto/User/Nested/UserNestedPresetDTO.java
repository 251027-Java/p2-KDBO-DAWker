package com.project.dawker.controller.dto.User.Nested;

import java.util.List;

public record UserNestedPresetDTO(
    Long id,
    String name,
    List<UserNestedPresetCategoryDTO> presetCategories,
    List<UserNestedPresetGearDTO> presetGears
) {
}
