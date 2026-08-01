package com.mana.manabackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "foodies", indexes = {
    @Index(name = "idx_foodie_email", columnList = "email", unique = true),
    @Index(name = "idx_foodie_phone", columnList = "phone_number")
})
public class Foodie {

    @Id
    @Column(name = "foodie_id", nullable = false, updatable = false, length = 36)
    private String foodieId;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    @Column(name = "phone_code", length = 5)
    private String phoneCode;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    // ── Health profile for AI matching ─────────────────────
    @Column(name = "health_goal", length = 50)
    private String healthGoal;        // lose-weight, build-muscle, diabetic, vegan, etc.

    @Column(name = "diet_type", length = 50)
    private String dietType;          // veg, non-veg, vegan, eggetarian

    @Column(name = "allergies", length = 255)
    private String allergies;         // comma-separated

    @Column(name = "taste_profile", length = 100)
    private String tasteProfile;      // spicy, mild, sweet, etc.

    // ── Address ─────────────────────────────────────────────
    @Column(name = "default_address", length = 255)
    private String defaultAddress;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "pincode", length = 6)
    private String pincode;

    // ── Timestamps ─────────────────────────────────────────
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    // ── Lifecycle ──────────────────────────────────────────
    @PrePersist
    protected void onCreate() {
        if (this.foodieId == null || this.foodieId.isBlank()) {
            this.foodieId = UUID.randomUUID().toString();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Constructors ────────────────────────────────────────
    public Foodie() {}

    // ── Getters & Setters ───────────────────────────────────
    public String getFoodieId() { return foodieId; }
    public void setFoodieId(String foodieId) { this.foodieId = foodieId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhoneCode() { return phoneCode; }
    public void setPhoneCode(String phoneCode) { this.phoneCode = phoneCode; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String url) { this.profileImageUrl = url; }

    public String getHealthGoal() { return healthGoal; }
    public void setHealthGoal(String healthGoal) { this.healthGoal = healthGoal; }

    public String getDietType() { return dietType; }
    public void setDietType(String dietType) { this.dietType = dietType; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getTasteProfile() { return tasteProfile; }
    public void setTasteProfile(String tasteProfile) { this.tasteProfile = tasteProfile; }

    public String getDefaultAddress() { return defaultAddress; }
    public void setDefaultAddress(String defaultAddress) { this.defaultAddress = defaultAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
}
