package com.project.dawker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.dawker.dto.dawDTO;
import com.project.dawker.dto.forumPostDTO;
import com.project.dawker.dto.userDTO;
import com.project.dawker.dto.recievedDto.receivedCommentDTO;
import com.project.dawker.dto.recievedDto.receivedForumDTO;
import com.project.dawker.entity.User;
import com.project.dawker.service.DawService;
import com.project.dawker.service.UserService;
import com.project.dawker.service.forumService;
import com.project.dawker.service.useService;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.List;
import java.util.Map;

// DAW CONTROLLER PRANAV!!!!
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class dawController {

    private final DawService dawService;
    private final useService useService;
    private final forumService forumService;

    public dawController(DawService dawService, useService useService, forumService forumService) {
        this.dawService = dawService;
        this.useService = useService;
        this.forumService = forumService;
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
        return this.useService.getAllUsers();
    }

    @GetMapping("/search/User")
    public userDTO getAUserById(@RequestParam Long Id) {
        return this.useService.getUserById(Id);
    }

    @GetMapping("/search/allForums")
    public List<forumPostDTO> getAllForums() {
        return this.forumService.getAllForums();
    }

    @GetMapping("/search/Forums")
    public forumPostDTO getForumById(@RequestParam Long Id) {
        return this.forumService.getForumById(Id);
    }

    // ------------------- POST METHODS ------------------

    // Creates an empty daw method
    @PostMapping("/create/daw")
    public void createDaw(@RequestParam Long userId, @RequestParam String dawName) {
        System.out.println("Creating DAW for User ID: " + userId + " with name: " + dawName);
        this.dawService.createDaw(userId, dawName);
    }

    @PostMapping("/save/Daw")
    public ResponseEntity<?> saveDaw(@RequestBody dawDTO payload) {

        // System.out.println("Saving DAW with ID: " + payload.getDawId() + " and name:
        // " + payload.getName());
        dawService.saveDaw(payload);

        return ResponseEntity.ok(payload);

    }

    // Forum based post requests
    @PostMapping("/saveForum")
    public ResponseEntity<?> saveForum(@RequestBody receivedForumDTO payload) {

        System.out.println("Saving Forum with userID: " + payload.getUserId());

        forumService.saveForum(payload);

        return ResponseEntity.ok(payload);

    }

    @PostMapping("/saveComment")
    public ResponseEntity<?> saveComment(@RequestBody receivedCommentDTO payload) {

        System.out.println(
                "Saving comment with userID: " + payload.getUserId() + ", on post: " + payload.getParentPostId());

        forumService.saveComment(payload);

        return ResponseEntity.ok(payload);

    }

}
