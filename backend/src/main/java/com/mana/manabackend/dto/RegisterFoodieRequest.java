package com.mana.manabackend.dto;

import jakarta.validation.constraints.*;

public class RegisterFoodieRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank @Email
    private String email;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String phoneCode = "+91";

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number")
    private String phoneNumber;

    // Health profile — optional at registration, used for AI matching
    private String healthGoal;   // lose-weight, build-muscle, diabetic, vegan, light
    private String dietType;     // veg, non-veg, vegan, eggetarian
    private String tasteProfile; // spicy, mild, sweet

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
    public String getHealthGoal() { return healthGoal; }
    public void setHealthGoal(String healthGoal) { this.healthGoal = healthGoal; }
    public String getDietType() { return dietType; }
    public void setDietType(String dietType) { this.dietType = dietType; }
    public String getTasteProfile() { return tasteProfile; }
    public void setTasteProfile(String tasteProfile) { this.tasteProfile = tasteProfile; }
}
