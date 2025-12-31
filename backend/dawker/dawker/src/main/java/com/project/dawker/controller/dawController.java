package com.project.dawker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.dawker.Service.DawService;
import com.project.dawker.Service.userService;
import com.project.dawker.dto.dawDTO;
import com.project.dawker.dto.userDTO;
import com.project.dawker.entity.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class dawController {

    private final DawService dawService;
    private final userService userService;

    public dawController(DawService dawService, userService userService) {
        this.dawService = dawService;
        this.userService = userService;
    }

    // ------------------ GET METHODS ------------------
    @Operation(summary = "Get DAW by ID with full details")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved DAW details")
    @GetMapping("/search/users")
    public List<dawDTO> getDawsByUserId(@RequestParam Long userId) {
        System.out.println("Fetching DAWs for User ID: " + userId);
        return dawService.getDawsByUserId(userId);
    }

    @GetMapping("/search/daw")
    public dawDTO getDawById(@RequestParam String dawId) {
        System.out.println("Fetching DAW with ID: " + dawId);
        System.out.println("Does the config work" + dawService.getDawById(dawId).getListOfConfigs().toString());
        return dawService.getDawById(dawId);
    }

    @GetMapping("/search/allDaws")
    public List<dawDTO> getAllDaws() {
        return dawService.getAllDaws();
    }

    @GetMapping("/search/allUsers")
    public List<userDTO> getAllUsers() {
        return this.userService.getAllUsers();
    }

    // ------------------- POST METHODS ------------------

    // Creates an empty daw method
    @PostMapping("/create/daw")
    public void createDaw(@RequestParam Long userId, @RequestParam String dawName) {
        System.out.println("Creating DAW for User ID: " + userId + " with name: " + dawName);
        this.dawService.createDaw(userId, dawName);
    }

    @PostMapping(value = "/save/Daw", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> saveDaw(@RequestBody Map<String, Object> payload) {

        // System.out.println("Saving DAW with ID: " + payload.getDawId() + " and name:
        // " + payload.getName());
        System.out.println(payload);
        dawDTO dawToSave = new dawDTO();

        System.out.println("Payload received: " + payload);

        return ResponseEntity.ok(payload);

    }
}
