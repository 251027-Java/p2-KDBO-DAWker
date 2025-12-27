package com.project.dawker.service;

import com.project.dawker.controller.dto.Category.CategoryRespDTO;
import com.project.dawker.controller.dto.GearItem.GearItemRespDTO;
import com.project.dawker.controller.dto.Preset.PresetRespDTO;
import com.project.dawker.controller.dto.PresetCategory.PresetCategoryRespDTO;
import com.project.dawker.controller.dto.PresetGear.PresetGearRespDTO;
import com.project.dawker.controller.dto.User.Nested.*;
import com.project.dawker.controller.dto.User.UserRespAllDTO;
import com.project.dawker.controller.dto.User.UserRespDTO;
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

    public UserRespAllDTO findByUsername(String username){
        return userRespToUserRespAllDTO(uServ.findByUsername(username)); // user info
    }

    // basically converted normal response DTOs into one single long nested response DTO for a single user
    // contains all their presets, and each category and gear item for each preset
    public UserRespNestedUserDTO userRespToUserRespAllNestedDTO(UserRespDTO user){
        long userId = user.id();

        // get all the presets for a user
        List<UserRespNestedPresetDTO> presets = new ArrayList<>();
        for (PresetRespDTO preset : pServ.findByUserId(userId)){
            long presetId = preset.id();

            // get all the preset categories for a preset
            List<UserRespNestedPresetCategoryDTO> presetCategories = new ArrayList<>();
            for (PresetCategoryRespDTO presetCategory : pcServ.findByPresetId(presetId)){
                CategoryRespDTO category = cServ.findById(presetCategory.categoryId()); // get category corresponding to the preset category
                UserRespNestedCategoryDTO nestedCategory = new UserRespNestedCategoryDTO(category.id(), category.categoryType()); // create nested category dto

                presetCategories.add(new UserRespNestedPresetCategoryDTO(presetCategory.id(), nestedCategory)); // create nested preset category dto
            }

            // get all the preset gear items for a preset
            List<UserRespNestedPresetGearDTO> presetGearItems = new ArrayList<>();
            for (PresetGearRespDTO presetGearItem : pgServ.findByPresetIdOrderByOrderIndexAsc(presetId)){
                GearItemRespDTO gearItem = gServ.findById(presetGearItem.gearItemId()); // get gear item corresponding to the preset gear item
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
    public UserRespAllDTO userRespToUserRespAllDTO(UserRespDTO user){
        Map<Long, PresetRespDTO> presets = new HashMap<>();
        Map<Long, PresetGearRespDTO> presetGears = new LinkedHashMap<>(); // LinkedHashMap to keep elements in ascending order of order index
        Map<Long, GearItemRespDTO> gearItems = new HashMap<>();
        Map<Long, PresetCategoryRespDTO> presetCategories = new HashMap<>();
        Map<Long, CategoryRespDTO> categories  = new HashMap<>();

        // get all the presets for a user
        for (PresetRespDTO preset : pServ.findByUserId(user.id())){
            long presetId = preset.id();
            presets.put(presetId, preset); // add preset

            // get all the preset categories for a preset
            for (PresetCategoryRespDTO presetCategory : pcServ.findByPresetId(presetId)){
                Long categoryId = presetCategory.categoryId();
                categories.put(categoryId, cServ.findById(categoryId)); // add category corresponding to the preset category

                presetCategories.put(presetCategory.id(), presetCategory); // add preset category
            }

            // get all the preset gear items for a preset
            for (PresetGearRespDTO presetGearItem : pgServ.findByPresetIdOrderByOrderIndexAsc(presetId)){
                Long gearItemId = presetGearItem.gearItemId();
                gearItems.put(gearItemId, gServ.findById(gearItemId)); // add gear item corresponding to the preset gear item

                presetGears.put(presetGearItem.id(), presetGearItem); // add preset gear item
            }
        }

        return new UserRespAllDTO(user, presets, presetGears, gearItems, presetCategories, categories);
    }
}
