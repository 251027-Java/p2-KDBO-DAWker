package com.project.dawker.controller;

import com.project.dawker.controller.dto.User.UserDTO;
import com.project.dawker.controller.dto.User.UserWOIDDTO;
import com.project.dawker.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService serv;

    public UserController(UserService userService) {
        serv = userService;
    }

    @GetMapping(params = { "id", "!username", "!search" })
    public UserDTO findById(@RequestParam Long id) {
        return serv.findById(id);
    }

    @GetMapping(params = { "!id", "username", "!search" })
    public UserDTO findByUsername(@RequestParam String username) {
        return serv.findByUsername(username);
    }

    @GetMapping("/exists")
    public boolean existsByUsername(@RequestParam String modelName) {
        return serv.existsByUsername(modelName);
    }

    @GetMapping(params = { "!id", "!username", "search" })
    public List<UserDTO> findByUsernameContainingIgnoreCase(@RequestParam String search) {
        return serv.findByUsernameContainingIgnoreCase(search);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDTO createUser(@RequestBody UserWOIDDTO dto) {
        return serv.createUser(dto);
    }

    @PutMapping
    public UserDTO updateUser(@RequestParam Long id, @RequestBody UserWOIDDTO dto) {
        return serv.updateUser(id, dto);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@RequestParam Long id) {
        serv.deleteUser(id);
    }
}
