package com.project.dawker.controller.dto.Preset;

import java.util.List;

public record PresetDTO(
    Long id,
    Long userId,
    String presetName,
    List<Long> presetGearIds,
    List<Long> presetCategoryIds
) {
}
