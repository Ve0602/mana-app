package com.mana.manabackend.controller;

import com.mana.manabackend.exception.ResourceNotFoundException;
import com.mana.manabackend.model.Cook;
import com.mana.manabackend.repository.CookRepository;
import com.mana.manabackend.services.FileUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cooks")
public class CooksController {

    private final CookRepository    cookRepo;
    private final FileUploadService fileService;

    public CooksController(CookRepository cookRepo, FileUploadService fileService) {
        this.cookRepo    = cookRepo;
        this.fileService = fileService;
    }

    // ── GET all cooks ────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Cook>> getAll(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String q) {

        List<Cook> result;
        if (q != null && !q.isBlank()) {
            result = cookRepo.searchAvailableCooks(q.trim());
        } else if (pincode != null && !pincode.isBlank()) {
            result = cookRepo.findByPincodeAndIsAvailableTrue(pincode.trim());
        } else if (city != null && !city.isBlank()) {
            result = cookRepo.findByCityAndIsAvailableTrue(city.trim());
        } else {
            result = cookRepo.findAll();
        }
        return ResponseEntity.ok(result);
    }

    // ── GET top rated ────────────────────────────────────────
    @GetMapping("/top-rated")
    public ResponseEntity<List<Cook>> getTopRated(
            @RequestParam(required = false) String city) {
        List<Cook> result = city != null
            ? cookRepo.findTopRatedCooksByCity(city)
            : cookRepo.findTopRatedCooks();
        return ResponseEntity.ok(result);
    }

    // ── GET by ID ────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Cook> getById(@PathVariable String id) {
        Cook cook = cookRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cook", id));
        return ResponseEntity.ok(cook);
    }

    // ── UPDATE cook profile ──────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Cook> update(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates,
            Authentication auth) {

        Cook cook = cookRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cook", id));

        // Only the cook themselves can update
        if (!cook.getEmail().equals(auth.getName()))
            return ResponseEntity.status(403).build();

        if (updates.containsKey("name"))        cook.setName((String) updates.get("name"));
        if (updates.containsKey("bio"))         cook.setBio((String) updates.get("bio"));
        if (updates.containsKey("kitchenName")) cook.setKitchenName((String) updates.get("kitchenName"));
        if (updates.containsKey("address"))     cook.setAddress((String) updates.get("address"));
        if (updates.containsKey("cookMood"))    cook.setCookMood((String) updates.get("cookMood"));
        if (updates.containsKey("phoneNumber")) cook.setPhoneNumber((String) updates.get("phoneNumber"));

        @SuppressWarnings("unchecked")
        List<String> spec = (List<String>) updates.get("speciality");
        if (spec != null) cook.setSpeciality(spec);

        return ResponseEntity.ok(cookRepo.save(cook));
    }

    // ── TOGGLE availability ──────────────────────────────────
    @PatchMapping("/{id}/availability")
    public ResponseEntity<Cook> toggleAvailability(
            @PathVariable String id,
            Authentication auth) {

        Cook cook = cookRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cook", id));

        if (!cook.getEmail().equals(auth.getName()))
            return ResponseEntity.status(403).build();

        cook.setIsAvailable(!Boolean.TRUE.equals(cook.getIsAvailable()));
        return ResponseEntity.ok(cookRepo.save(cook));
    }

    // ── UPDATE mood ──────────────────────────────────────────
    @PatchMapping("/{id}/mood")
    public ResponseEntity<Cook> updateMood(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication auth) {

        Cook cook = cookRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cook", id));

        if (!cook.getEmail().equals(auth.getName()))
            return ResponseEntity.status(403).build();

        String mood = body.get("mood");
        if (mood != null && mood.length() > 200)
            mood = mood.substring(0, 200);

        cook.setCookMood(mood);
        return ResponseEntity.ok(cookRepo.save(cook));
    }

    // ── UPLOAD profile image ─────────────────────────────────
    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {

        Cook cook = cookRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cook", id));

        if (!cook.getEmail().equals(auth.getName()))
            return ResponseEntity.status(403).build();

        try {
            String url = fileService.upload(file, "cooks/" + id);
            cook.setProfileImageUrl(url);
            return ResponseEntity.ok(cookRepo.save(cook));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    // ── DELETE cook ──────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            Authentication auth) {

        Cook cook = cookRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cook", id));

        if (!cook.getEmail().equals(auth.getName()))
            return ResponseEntity.status(403).build();

        cookRepo.delete(cook);
        return ResponseEntity.noContent().build();
    }
}
