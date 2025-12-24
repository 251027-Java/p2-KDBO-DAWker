package com.project.dawker.controller;

import com.project.dawker.controller.dto.Category.CategoryAllRespDTO;
import com.project.dawker.controller.dto.Category.CategoryRespDTO;
import com.project.dawker.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService serv;

    public CategoryController(CategoryService categoryService) {
        serv = categoryService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public CategoryRespDTO findByCategoryType(@RequestParam String type) {
        return serv.findByCategoryType(type);
    }

    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    public CategoryAllRespDTO findByCategoryTypeAll(@RequestParam String type) {
        return serv.findByCategoryTypeAll(type);
    }

    @GetMapping("/exists")
    @ResponseStatus(HttpStatus.OK)
    public boolean existsByCategoryType(@RequestParam String type) {
        return serv.existsByCategoryType(type);
    }
}
