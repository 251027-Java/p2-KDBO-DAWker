
package com.project.dawker.service;

import com.project.dawker.controller.dto.User.UserDTO;
import com.project.dawker.controller.dto.User.UserWOIDDTO;
import com.project.dawker.entity.Preset;
import com.project.dawker.entity.User;
import com.project.dawker.exception.PresetNotFoundException;
import com.project.dawker.exception.UserNotFoundException;
import com.project.dawker.repository.PresetRepository;
import com.project.dawker.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class UserService {
    private final UserRepository repo;
    private final PresetRepository pRepo;

    public UserService(UserRepository userRepository, PresetRepository presetRepository){
        repo = userRepository;
        pRepo = presetRepository;
    }

    public UserDTO findById(Long id){
        return userToDTO(repo.findById(id).orElseThrow(() -> new UserNotFoundException(
            String.format("User ID = %d not found.", id))));
    }

    public UserDTO findByUsername(String username){
        return userToDTO(repo.findByUsername(username).orElseThrow(() -> new UserNotFoundException(
            String.format("Username = %s not found.", username))));
    }

    public boolean existsByUsername(String username){
        return repo.existsByUsername(username);
    }

    public List<UserDTO> findByUsernameContainingIgnoreCase(String search){
        return repo.findByUsernameContainingIgnoreCase(search).stream().map(this::userToDTO).toList();
    }

    public UserDTO createUser(UserWOIDDTO dto) {
        User user = new User();
        user.setUsername(dto.username());
        user.setPassword(dto.password());
        user.setRole(dto.role());
        user.setPresets(dto.presetIds().stream().map(pId -> pRepo.findById(pId).orElseThrow(() ->
            new PresetNotFoundException(String.format("Preset ID = %d not found.", pId)))).toList());
        return userToDTO(repo.save(user));
    }

    public UserDTO updateUser(Long id, UserWOIDDTO dto) {
        User user = repo.findById(id).orElseThrow(() -> new UserNotFoundException(
            String.format("User ID = %d not found.", id)));
        user.setUsername(dto.username());
        user.setPassword(dto.password());
        user.setRole(dto.role());
        user.setPresets(dto.presetIds().stream().map(pId -> pRepo.findById(pId).orElseThrow(() ->
            new PresetNotFoundException(String.format("Preset ID = %d not found.", pId)))).toList());
        return userToDTO(user);
    }

    public void deleteUser(Long id) {
        repo.deleteById(id);
    }

    private UserDTO userToDTO(User user){
        return new UserDTO(user.getId(), user.getUsername(), user.getRole(),
            user.getPresets().stream().map(Preset::getId).toList());
    }
}
