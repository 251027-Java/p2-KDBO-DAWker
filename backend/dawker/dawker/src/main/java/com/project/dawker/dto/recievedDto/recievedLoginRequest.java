package com.project.dawker.dto.recievedDto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class recievedLoginRequest {
    private String email;
    private String userPassword;
}
