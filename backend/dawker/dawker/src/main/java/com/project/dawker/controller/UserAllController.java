package com.project.dawker.controller;

import com.project.dawker.controller.dto.User.Nested.UserRespNestedUserDTO;
import com.project.dawker.controller.dto.User.UserRespAllDTO;
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

    @GetMapping("/nested")
    public UserRespNestedUserDTO findByUsernameNested(@RequestParam String username) {
        return serv.findByUsernameNested(username);
    }

    @GetMapping
    public UserRespAllDTO findByUsername(@RequestParam String username) {
        return serv.findByUsername(username);
    }
}
