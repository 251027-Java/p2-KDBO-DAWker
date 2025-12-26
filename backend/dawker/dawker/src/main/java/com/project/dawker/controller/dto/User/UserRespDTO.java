package com.project.dawker.controller.dto.User;

import java.util.List;

public record UserRespDTO(
    Long id,
    String username,
    String role,
    List<Long> presetIds
) {
}
