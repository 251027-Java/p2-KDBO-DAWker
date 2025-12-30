package com.project.dawker.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.dawker.Service.DawService;
import com.project.dawker.dto.dawDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class dawController {

    private final DawService dawService;

    public dawController(DawService dawService) {
        this.dawService = dawService;
    }

    @Operation(summary = "Get DAW by ID with full details")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved DAW details")
    @GetMapping
    public dawDTO getDawById(@RequestParam String dawId) {
        System.out.println("Fetching DAW with ID: " + dawId);
        System.out.println("Does the config work" + dawService.getDawById(dawId).getListOfConfigs().toString());
        return dawService.getDawById(dawId);
    }

    @GetMapping("/allDaws")
    public List<dawDTO> getAllDaws() {
        return dawService.getAllDaws();
    }
}
