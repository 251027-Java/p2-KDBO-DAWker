package com.project.dawker.controller.dto.User.Nested;

import java.util.List;

public record UserNestedUserDTO(
    Long id,
    String username,
    String role,
    List<UserNestedPresetDTO> presets
) {
}
