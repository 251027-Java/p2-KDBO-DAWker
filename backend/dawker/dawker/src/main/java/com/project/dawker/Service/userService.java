package com.project.dawker.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.project.dawker.dto.userDTO;
import com.project.dawker.dto.dawDTO;
import com.project.dawker.repository.UserRepository;

@Service
public class userService {

    private final UserRepository userRepository;

    public userService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<userDTO> getAllUsers() {
        return this.userRepository.findAll().stream()
                .map(user -> new userDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                        user.getDaws().stream()
                                .map(daw -> new dawDTO(daw.getId(), daw.getUser().getId(), daw.getName(), null)) // Simplified
                                                                                                                 // dawDTO
                                .toList()))
                .collect(Collectors.toList());
    }
}
