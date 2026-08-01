package com.mana.manabackend.controller;

import com.mana.manabackend.exception.ResourceNotFoundException;
import com.mana.manabackend.model.Foodie;
import com.mana.manabackend.repository.FoodieRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/foodies")
public class FoodieController {

    private final FoodieRepository foodieRepo;

    public FoodieController(FoodieRepository foodieRepo) {
        this.foodieRepo = foodieRepo;
    }

    // ── GET my profile ───────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<Foodie> getMe(Authentication auth) {
        Foodie foodie = foodieRepo.findByEmail(auth.getName())
            .orElseThrow(() -> new ResourceNotFoundException("Foodie not found"));
        // Never return password
        foodie.setPassword(null);
        return ResponseEntity.ok(foodie);
    }

    // ── GET by ID ────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Foodie> getById(@PathVariable String id, Authentication auth) {
        Foodie foodie = foodieRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Foodie", id));

        // Only the foodie themselves can see full profile
        if (!foodie.getEmail().equals(auth.getName()))
            return ResponseEntity.status(403).build();

        foodie.setPassword(null);
        return ResponseEntity.ok(foodie);
    }

    // ── UPDATE profile ───────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Foodie> update(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates,
            Authentication auth) {

        Foodie foodie = foodieRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Foodie", id));

        if (!foodie.getEmail().equals(auth.getName()))
            return ResponseEntity.status(403).build();

        if (updates.containsKey("name"))           foodie.setName((String) updates.get("name"));
        if (updates.containsKey("phoneNumber"))    foodie.setPhoneNumber((String) updates.get("phoneNumber"));
        if (updates.containsKey("defaultAddress")) foodie.setDefaultAddress((String) updates.get("defaultAddress"));
        if (updates.containsKey("city"))           foodie.setCity((String) updates.get("city"));
        if (updates.containsKey("pincode"))        foodie.setPincode((String) updates.get("pincode"));
        if (updates.containsKey("healthGoal"))     foodie.setHealthGoal((String) updates.get("healthGoal"));
        if (updates.containsKey("dietType"))       foodie.setDietType((String) updates.get("dietType"));
        if (updates.containsKey("tasteProfile"))   foodie.setTasteProfile((String) updates.get("tasteProfile"));
        if (updates.containsKey("allergies"))      foodie.setAllergies((String) updates.get("allergies"));

        foodie.setPassword(null);
        return ResponseEntity.ok(foodieRepo.save(foodie));
    }
}
