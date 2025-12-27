package com.project.dawker.controller.dto.User.Nested;

import java.util.List;

public record UserRespNestedPresetDTO(
    Long id,
    String name,
    List<UserRespNestedPresetCategoryDTO> presetCategories,
    List<UserRespNestedPresetGearDTO> presetGears
) {
}
