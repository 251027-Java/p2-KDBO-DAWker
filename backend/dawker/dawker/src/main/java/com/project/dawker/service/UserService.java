package com.project.dawker.service;

import com.project.dawker.controller.dto.User.UserRespDTO;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.User;
import com.project.dawker.exception.UserNotFoundException;
import com.project.dawker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository userRepository){
        repo = userRepository;
    }

    public UserRespDTO findByUsername(String username){
        return userToRespDTO(repo.findByUsername(username).orElseThrow(() -> new UserNotFoundException(
            String.format("Username = %s not found.", username))));
    }

    public boolean existsByUsername(String username){
        return repo.existsByUsername(username);
    }

    public List<UserRespDTO> findByUsernameContainingIgnoreCase(String search){
        return repo.findByUsernameContainingIgnoreCase(search).stream().map(this::userToRespDTO).toList();
    }

    private UserRespDTO userToRespDTO(User user){
        return new UserRespDTO(user.getId(), user.getUsername(), user.getRole(),
            user.getPresets().stream().map(Preset::getId).toList());
    }
}
