package com.project.dawker.controller;

import com.project.dawker.controller.dto.Category.CategoryRespDTO;
import com.project.dawker.service.CategoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService serv;

    public CategoryController(CategoryService categoryService) {
        serv = categoryService;
    }

    @GetMapping
    public CategoryRespDTO findByCategoryType(@RequestParam String type) {
        return serv.findByCategoryType(type);
    }

    @GetMapping("/exists")
    public boolean existsByCategoryType(@RequestParam String type) {
        return serv.existsByCategoryType(type);
    }
}
