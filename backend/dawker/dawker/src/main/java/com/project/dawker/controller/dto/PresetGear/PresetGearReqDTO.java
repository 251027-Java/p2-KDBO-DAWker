package com.project.dawker.controller.dto.PresetGear;

public record PresetGearReqDTO(
    Long presetId,
    Long gearItemId,
    Double gainValue,
    Double toneValue,
    Integer orderIndex
) {
}
