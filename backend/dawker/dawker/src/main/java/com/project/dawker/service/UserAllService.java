package com.project.dawker.service;

import com.project.dawker.controller.dto.Category.CategoryDTO;
import com.project.dawker.controller.dto.GearItem.GearItemDTO;
import com.project.dawker.controller.dto.Preset.PresetDTO;
import com.project.dawker.controller.dto.PresetCategory.PresetCategoryDTO;
import com.project.dawker.controller.dto.PresetGear.PresetGearDTO;
import com.project.dawker.controller.dto.User.Nested.*;
import com.project.dawker.controller.dto.User.UserAllDTO;
import com.project.dawker.controller.dto.User.UserDTO;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserAllService {
    private final UserService uServ;
    private final PresetService pServ;
    private final PresetCategoryService pcServ;
    private final PresetGearService pgServ;
    private final CategoryService cServ;
    private final GearItemService gServ;

    public UserAllService(UserService userService, PresetService presetService, PresetCategoryService presetCategoryService,
                          PresetGearService presetGearService, CategoryService categoryService, GearItemService gearItemService){
        uServ = userService;
        pServ = presetService;
        pcServ = presetCategoryService;
        pgServ = presetGearService;
        cServ = categoryService;
        gServ = gearItemService;
    }

    public UserRespNestedUserDTO findByUsernameNested(String username){
        return userRespToUserRespAllNestedDTO(uServ.findByUsername(username)); // user info
    }

    public UserAllDTO findByUsername(String username){
        return userRespToUserRespAllDTO(uServ.findByUsername(username)); // user info
    }

    // basically converted normal response DTOs into one single long nested response DTO for a single user
    // contains all their presets, and each category and gear item for each preset
    public UserRespNestedUserDTO userRespToUserRespAllNestedDTO(UserDTO user){
        long userId = user.id();

        // get all the presets for a user
        List<UserRespNestedPresetDTO> presets = new ArrayList<>();
        for (PresetDTO preset : pServ.findByUserId(userId)){
            long presetId = preset.id();

            // get all the preset categories for a preset
            List<UserRespNestedPresetCategoryDTO> presetCategories = new ArrayList<>();
            for (PresetCategoryDTO presetCategory : pcServ.findByPresetId(presetId)){
                CategoryDTO category = cServ.findById(presetCategory.categoryId()); // get category corresponding to the preset category
                UserRespNestedCategoryDTO nestedCategory = new UserRespNestedCategoryDTO(category.id(), category.categoryType()); // create nested category dto

                presetCategories.add(new UserRespNestedPresetCategoryDTO(presetCategory.id(), nestedCategory)); // create nested preset category dto
            }

            // get all the preset gear items for a preset
            List<UserRespNestedPresetGearDTO> presetGearItems = new ArrayList<>();
            for (PresetGearDTO presetGearItem : pgServ.findByPresetIdOrderByOrderIndexAsc(presetId)){
                GearItemDTO gearItem = gServ.findById(presetGearItem.gearItemId()); // get gear item corresponding to the preset gear item
                UserRespNestedGearItemDTO nestedGearItem = new UserRespNestedGearItemDTO(gearItem.id(), gearItem.modelName(), gearItem.gearType()); // create nested gear item dto

                presetGearItems.add(new UserRespNestedPresetGearDTO(presetGearItem.id(), presetGearItem.gainValue(),
                    presetGearItem.toneValue(), presetGearItem.orderIndex(), nestedGearItem)); // create nested preset gear item dto
            }

            // create nested preset dto
            presets.add(new UserRespNestedPresetDTO(presetId, preset.presetName(), presetCategories, presetGearItems));
        }

        // create nested user dto
        return new UserRespNestedUserDTO(userId, user.username(), user.role(), presets);
    }

    // taking all the DTOs of presets, and each category and gear item for each preset, and putting them all into 1 big DTO,
    // which is the main userDTO and a few maps from ID -> corresponding DTOs
    public UserAllDTO userRespToUserRespAllDTO(UserDTO user){
        Map<Long, PresetDTO> presets = new HashMap<>();
        Map<Long, PresetGearDTO> presetGears = new LinkedHashMap<>(); // LinkedHashMap to keep elements in ascending order of order index
        Map<Long, GearItemDTO> gearItems = new HashMap<>();
        Map<Long, PresetCategoryDTO> presetCategories = new HashMap<>();
        Map<Long, CategoryDTO> categories  = new HashMap<>();

        // get all the presets for a user
        for (PresetDTO preset : pServ.findByUserId(user.id())){
            long presetId = preset.id();
            presets.put(presetId, preset); // add preset

            // get all the preset categories for a preset
            for (PresetCategoryDTO presetCategory : pcServ.findByPresetId(presetId)){
                Long categoryId = presetCategory.categoryId();
                categories.put(categoryId, cServ.findById(categoryId)); // add category corresponding to the preset category

                presetCategories.put(presetCategory.id(), presetCategory); // add preset category
            }

            // get all the preset gear items for a preset
            for (PresetGearDTO presetGearItem : pgServ.findByPresetIdOrderByOrderIndexAsc(presetId)){
                Long gearItemId = presetGearItem.gearItemId();
                gearItems.put(gearItemId, gServ.findById(gearItemId)); // add gear item corresponding to the preset gear item

                presetGears.put(presetGearItem.id(), presetGearItem); // add preset gear item
            }
        }

        return new UserAllDTO(user, presets, presetGears, gearItems, presetCategories, categories);
    }
}
