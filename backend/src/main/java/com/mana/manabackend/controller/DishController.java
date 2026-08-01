package com.mana.manabackend.controller;

import com.mana.manabackend.exception.BusinessException;
import com.mana.manabackend.exception.ResourceNotFoundException;
import com.mana.manabackend.model.Dish;
import com.mana.manabackend.repository.CookRepository;
import com.mana.manabackend.repository.DishRepository;
import com.mana.manabackend.services.FileUploadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dishes")
public class DishController {

    private final DishRepository    dishRepo;
    private final CookRepository    cookRepo;
    private final FileUploadService fileService;

    public DishController(DishRepository dishRepo,
                          CookRepository cookRepo,
                          FileUploadService fileService) {
        this.dishRepo    = dishRepo;
        this.cookRepo    = cookRepo;
        this.fileService = fileService;
    }

    // ── GET all dishes by cook ───────────────────────────────
    @GetMapping("/cook/{cookId}")
    public ResponseEntity<List<Dish>> getByCook(@PathVariable String cookId) {
        return ResponseEntity.ok(dishRepo.findByCookId(cookId));
    }

    // ── GET dish by ID ───────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Dish> getById(@PathVariable String id) {
        Dish dish = dishRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dish", id));
        return ResponseEntity.ok(dish);
    }

    // ── SEARCH dishes ────────────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<List<Dish>> search(@RequestParam String q) {
        return ResponseEntity.ok(dishRepo.fullTextSearch(q.trim()));
    }

    // ── GET by health tag ────────────────────────────────────
    @GetMapping("/health/{tag}")
    public ResponseEntity<List<Dish>> getByHealthTag(@PathVariable String tag) {
        return ResponseEntity.ok(dishRepo.findByHealthTag(tag));
    }

    // ── GET top rated dishes ─────────────────────────────────
    @GetMapping("/top-rated")
    public ResponseEntity<List<Dish>> getTopRated() {
        return ResponseEntity.ok(dishRepo.findTopRatedDishes());
    }

    // ── CREATE dish ──────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Dish> create(
            @Valid @RequestBody Dish dish,
            Authentication auth) {

        String email = auth.getName();
        var cook = cookRepo.findByEmail(email)
            .orElseThrow(() -> new BusinessException("Only cooks can add dishes"));

        dish.setCookId(cook.getCookId());
        dish.setKitchenName(cook.getKitchenName());

        return ResponseEntity.status(HttpStatus.CREATED).body(dishRepo.save(dish));
    }

    // ── UPDATE dish ──────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Dish> update(
            @PathVariable String id,
            @RequestBody Dish updated,
            Authentication auth) {

        Dish dish = dishRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dish", id));

        String email = auth.getName();
        cookRepo.findByEmail(email)
            .filter(c -> c.getCookId().equals(dish.getCookId()))
            .orElseThrow(() -> new BusinessException("You can only edit your own dishes"));

        // Update allowed fields
        if (updated.getDishName()    != null) dish.setDishName(updated.getDishName());
        if (updated.getDescription() != null) dish.setDescription(updated.getDescription());
        if (updated.getPrice()       != null) dish.setPrice(updated.getPrice());
        if (updated.getCategory()    != null) dish.setCategory(updated.getCategory());
        if (updated.getType()        != null) dish.setType(updated.getType());
        if (updated.getIsAvailable() != null) dish.setIsAvailable(updated.getIsAvailable());
        if (updated.getHealthTags()  != null) dish.setHealthTags(updated.getHealthTags());
        if (updated.getCalories()    != null) dish.setCalories(updated.getCalories());
        if (updated.getProteinGrams()!= null) dish.setProteinGrams(updated.getProteinGrams());

        return ResponseEntity.ok(dishRepo.save(dish));
    }

    // ── TOGGLE availability ──────────────────────────────────
    @PatchMapping("/{id}/availability")
    public ResponseEntity<Dish> toggleAvailability(
            @PathVariable String id,
            Authentication auth) {

        Dish dish = dishRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dish", id));

        String email = auth.getName();
        cookRepo.findByEmail(email)
            .filter(c -> c.getCookId().equals(dish.getCookId()))
            .orElseThrow(() -> new BusinessException("You can only edit your own dishes"));

        dish.setIsAvailable(!Boolean.TRUE.equals(dish.getIsAvailable()));
        return ResponseEntity.ok(dishRepo.save(dish));
    }

    // ── UPLOAD dish image ────────────────────────────────────
    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {

        Dish dish = dishRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dish", id));

        String email = auth.getName();
        cookRepo.findByEmail(email)
            .filter(c -> c.getCookId().equals(dish.getCookId()))
            .orElseThrow(() -> new BusinessException("You can only edit your own dishes"));

        try {
            String url = fileService.upload(file, "dishes/" + id);
            dish.setImageUrl(url);
            return ResponseEntity.ok(dishRepo.save(dish));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    // ── DELETE dish ──────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            Authentication auth) {

        Dish dish = dishRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dish", id));

        String email = auth.getName();
        cookRepo.findByEmail(email)
            .filter(c -> c.getCookId().equals(dish.getCookId()))
            .orElseThrow(() -> new BusinessException("You can only delete your own dishes"));

        dishRepo.delete(dish);
        return ResponseEntity.noContent().build();
    }
}
