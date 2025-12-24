package com.project.dawker.controller.dto.PresetGear;

public record PresetGearRespDTO(
    Long id,
    Long presetId,
    Long gearItemId,
    Double gainValue,
    Double toneValue,
    Integer orderIndex
) {
}
