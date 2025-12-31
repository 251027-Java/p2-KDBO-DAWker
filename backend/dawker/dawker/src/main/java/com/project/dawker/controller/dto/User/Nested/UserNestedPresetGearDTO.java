package com.project.dawker.controller.dto.User.Nested;

public record UserNestedPresetGearDTO(
    Long id,
    Double gainValue,
    Double toneValue,
    Integer orderIndex,
    UserNestedGearItemDTO gearItem
) {
}
