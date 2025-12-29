package com.project.dawker.dto;

import java.util.Map;

public class settingsDTO {

    private Long id;
    private String technology; // 'RNBO' | 'TONEJS'
    private String exportName;
    private Map<String, Object> parameters; // JSON string representing parameters
}
