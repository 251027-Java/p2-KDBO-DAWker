package com.project.dawker.controller;

import com.project.dawker.controller.dto.Category.CategoryDTO;
import com.project.dawker.service.CategoryService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService serv;

    public CategoryController(CategoryService categoryService) {
        serv = categoryService;
    }

    @GetMapping(params = { "id", "!type" })
    public CategoryDTO findById(@RequestParam Long id) {
        return serv.findById(id);
    }

    @GetMapping(params = { "!id", "type" })
    public CategoryDTO findByCategoryType(@RequestParam String type) {
        return serv.findByCategoryType(type);
    }

    @GetMapping("/exists")
    public boolean existsByCategoryType(@RequestParam String type) {
        return serv.existsByCategoryType(type);
    }
}
