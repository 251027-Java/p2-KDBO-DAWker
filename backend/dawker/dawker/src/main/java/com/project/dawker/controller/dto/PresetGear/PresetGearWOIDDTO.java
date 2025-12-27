package com.project.dawker.controller.dto.PresetGear;

public record PresetGearWOIDDTO(
    Long presetId,
    Long gearItemId,
    Double gainValue,
    Double toneValue,
    Integer orderIndex
) {
}
