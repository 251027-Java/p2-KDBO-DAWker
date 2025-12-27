package com.project.dawker.controller.dto.User.Nested;

public record UserRespNestedPresetGearDTO(
    Long id,
    Double gainValue,
    Double toneValue,
    Integer orderIndex,
    UserRespNestedGearItemDTO gearItem
) {
}
