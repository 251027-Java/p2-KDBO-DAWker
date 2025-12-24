package com.project.dawker.controller.dto.User;

public record UserReqDTO(
    String username,
    String password,
    String role
) {}