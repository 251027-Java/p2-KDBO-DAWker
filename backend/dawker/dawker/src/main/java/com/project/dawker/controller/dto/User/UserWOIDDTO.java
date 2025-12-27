package com.project.dawker.controller.dto.User;

import java.util.List;

public record UserWOIDDTO(
    String username,
    String password,
    String role,
    List<Long> presetIds
) {}