package com.project.dawker.controller.dto.User.Nested;

import java.util.List;

public record UserRespNestedUserDTO(
    Long id,
    String username,
    String role,
    List<UserRespNestedPresetDTO> presets
) {
}
