package com.project.dawker.controller.dto.GearItem;

import java.util.List;

public record GearItemRespDTO(
    Long id,
    String modelName,
    String gearType,
    List<Long> presetGearIds
) {
}
