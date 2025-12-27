package com.project.dawker.controller.dto.Category;

import java.util.List;

public record CategoryDTO(
    Long id,
    String categoryType,
    List<Long> presetCategoryIds
) {
}
