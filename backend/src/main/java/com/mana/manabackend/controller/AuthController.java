package com.mana.manabackend.controller;

import com.mana.manabackend.dto.AuthRequest;
import com.mana.manabackend.dto.AuthResponse;
import com.mana.manabackend.dto.RegisterCookRequest;
import com.mana.manabackend.dto.RegisterFoodieRequest;
import com.mana.manabackend.model.Cook;
import com.mana.manabackend.model.Foodie;
import com.mana.manabackend.repository.CookRepository;
import com.mana.manabackend.repository.FoodieRepository;
import com.mana.manabackend.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final CookRepository cookRepository;
    private final FoodieRepository foodieRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;

    public AuthController(CookRepository cookRepository,
                          FoodieRepository foodieRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          AuthenticationManager authManager,
                          UserDetailsService userDetailsService) {
        this.cookRepository = cookRepository;
        this.foodieRepository = foodieRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authManager = authManager;
        this.userDetailsService = userDetailsService;
    }

    // ── Register Cook ────────────────────────────────────────
    @PostMapping("/cook/register")
    public ResponseEntity<?> registerCook(@Valid @RequestBody RegisterCookRequest req) {
        if (cookRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "A cook with this email already exists"));
        }

        Cook cook = new Cook();
        cook.setName(req.getName());
        cook.setEmail(req.getEmail().toLowerCase());
        cook.setPassword(passwordEncoder.encode(req.getPassword()));
        cook.setAddress(req.getAddress());
        cook.setCity(req.getCity());
        cook.setPincode(req.getPincode());
        cook.setState(req.getState());
        cook.setPhoneCode(req.getPhoneCode());
        cook.setPhoneNumber(req.getPhoneNumber());
        cook.setKitchenName(req.getKitchenName());
        cook.setSpeciality(req.getSpeciality());
        cook.setBio(req.getBio());

        Cook saved = cookRepository.save(cook);

        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtUtil.generateToken(userDetails, "COOK", saved.getCookId());

        return ResponseEntity.status(HttpStatus.CREATED).body(
            AuthResponse.builder()
                .token(token)
                .role("COOK")
                .userId(saved.getCookId())
                .name(saved.getName())
                .email(saved.getEmail())
                .message("Welcome to Mana, " + saved.getName() + "! Your kitchen is ready.")
                .build()
        );
    }

    // ── Register Foodie ──────────────────────────────────────
    @PostMapping("/foodie/register")
    public ResponseEntity<?> registerFoodie(@Valid @RequestBody RegisterFoodieRequest req) {
        if (foodieRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "An account with this email already exists"));
        }

        Foodie foodie = new Foodie();
        foodie.setName(req.getName());
        foodie.setEmail(req.getEmail().toLowerCase());
        foodie.setPassword(passwordEncoder.encode(req.getPassword()));
        foodie.setPhoneCode(req.getPhoneCode());
        foodie.setPhoneNumber(req.getPhoneNumber());
        foodie.setHealthGoal(req.getHealthGoal());
        foodie.setDietType(req.getDietType());

        Foodie saved = foodieRepository.save(foodie);

        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtUtil.generateToken(userDetails, "FOODIE", saved.getFoodieId());

        return ResponseEntity.status(HttpStatus.CREATED).body(
            AuthResponse.builder()
                .token(token)
                .role("FOODIE")
                .userId(saved.getFoodieId())
                .name(saved.getName())
                .email(saved.getEmail())
                .message("Welcome to Mana, " + saved.getName() + "! Taste of home, delivered.")
                .build()
        );
    }

    // ── Login (Cook or Foodie) ───────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest req) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid email or password"));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
        String role = userDetails.getAuthorities().stream()
            .findFirst()
            .map(a -> a.getAuthority().replace("ROLE_", ""))
            .orElse("UNKNOWN");

        String userId = "";
        String name = "";

        if ("COOK".equals(role)) {
            var cook = cookRepository.findByEmail(req.getEmail()).orElseThrow();
            userId = cook.getCookId();
            name = cook.getName();
        } else {
            var foodie = foodieRepository.findByEmail(req.getEmail()).orElseThrow();
            userId = foodie.getFoodieId();
            name = foodie.getName();
        }

        String token = jwtUtil.generateToken(userDetails, role, userId);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return ResponseEntity.ok(
            AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .role(role)
                .userId(userId)
                .name(name)
                .email(req.getEmail())
                .message("Welcome back, " + name + "!")
                .build()
        );
    }
}
