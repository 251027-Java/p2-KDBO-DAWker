package com.project.dawker.controller;

import com.project.dawker.controller.dto.User.UserDTO;
import com.project.dawker.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService serv;

    public UserController(UserService userService){
        serv = userService;
    }

    @GetMapping(params = {"username", "!search"})
    public UserDTO findByUsername(@RequestParam String username){
        return serv.findByUsername(username);
    }

    @GetMapping("/exists")
    public boolean existsByUsername(@RequestParam String modelName){
        return serv.existsByUsername(modelName);
    }

    @GetMapping(params = {"!username", "search"})
    public List<UserDTO> findByUsernameContainingIgnoreCase(@RequestParam String search){
        return serv.findByUsernameContainingIgnoreCase(search);
    }
}
