package com.project.dawker.service;

import com.project.dawker.controller.dto.User.UserDTO;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.User;
import com.project.dawker.exception.UserNotFoundException;
import com.project.dawker.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository userRepository){
        repo = userRepository;
    }

    public UserDTO findById(Long id){
        return userToRespDTO(repo.findById(id).orElseThrow(() -> new UserNotFoundException(
            String.format("User ID = %d not found.", id))));
    }

    public UserDTO findByUsername(String username){
        return userToRespDTO(repo.findByUsername(username).orElseThrow(() -> new UserNotFoundException(
            String.format("Username = %s not found.", username))));
    }

    public boolean existsByUsername(String username){
        return repo.existsByUsername(username);
    }

    public List<UserDTO> findByUsernameContainingIgnoreCase(String search){
        return repo.findByUsernameContainingIgnoreCase(search).stream().map(this::userToRespDTO).toList();
    }

    private UserDTO userToRespDTO(User user){
        return new UserDTO(user.getId(), user.getUsername(), user.getRole(),
            user.getPresets().stream().map(Preset::getId).toList());
    }
}
