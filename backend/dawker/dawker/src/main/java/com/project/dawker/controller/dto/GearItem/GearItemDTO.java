package com.project.dawker.controller.dto.GearItem;

import java.util.List;

public record GearItemDTO(
    Long id,
    String modelName,
    String gearType,
    List<Long> presetGearIds
) {
}
