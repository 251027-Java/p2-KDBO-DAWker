package com.project.dawker.controller;

import com.project.dawker.controller.dto.User.Nested.UserNestedUserDTO;
import com.project.dawker.controller.dto.User.UserAllDTO;
import com.project.dawker.service.UserAllService;
import org.springframework.web.bind.annotation.*;

// NOTE: this controller finds all the info for ONE user
//       to get info for all users by searching a username, go to the UserController.findByUsernameContainingIgnoreCase

@RestController
@RequestMapping("/api/users/all")
public class UserAllController {
    private final UserAllService serv;

    public UserAllController(UserAllService userAllService){
        serv = userAllService;
    }

    @GetMapping(path = "/nested", params = {"id", "!username"})
    public UserNestedUserDTO findByIdNested(@RequestParam Long id) {
        return serv.findByIdNested(id);
    }

    @GetMapping(params = {"id", "!username"})
    public UserAllDTO findById(@RequestParam Long id) {
        return serv.findById(id);
    }

    @GetMapping(path = "/nested", params = {"!id", "username"})
    public UserNestedUserDTO findByUsernameNested(@RequestParam String username) {
        return serv.findByUsernameNested(username);
    }

    @GetMapping(params = {"!id", "username"})
    public UserAllDTO findByUsername(@RequestParam String username) {
        return serv.findByUsername(username);
    }
}
