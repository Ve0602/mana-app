package com.mana.manabackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cooks", indexes = {
    @Index(name = "idx_cook_email", columnList = "email", unique = true),
    @Index(name = "idx_cook_city", columnList = "city"),
    @Index(name = "idx_cook_pincode", columnList = "pincode")
})
public class Cook {

    @Id
    @Column(name = "cook_id", nullable = false, updatable = false, length = 36)
    private String cookId;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Address is required")
    @Column(nullable = false, length = 255)
    private String address;

    @NotBlank(message = "City is required")
    @Column(nullable = false, length = 100)
    private String city;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid Indian pincode")
    @Column(nullable = false, length = 6)
    private String pincode;

    @NotBlank(message = "State is required")
    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "phone_code", length = 5)
    private String phoneCode;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;

    @NotBlank(message = "Kitchen name is required")
    @Size(min = 2, max = 150, message = "Kitchen name must be between 2 and 150 characters")
    @Column(name = "kitchen_name", nullable = false, length = 150)
    private String kitchenName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cook_specialities",
        joinColumns = @JoinColumn(name = "cook_id"))
    @Column(name = "speciality", length = 100)
    private List<String> speciality = new ArrayList<>();

    // ── Profile fields ─────────────────────────────────────
    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "cook_mood", length = 200)
    private String cookMood;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "avg_rating")
    private Double avgRating = 0.0;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    @Column(name = "total_deliveries")
    private Integer totalDeliveries = 0;

    // ── Timestamps ─────────────────────────────────────────
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Lifecycle hooks ─────────────────────────────────────
    @PrePersist
    protected void onCreate() {
        if (this.cookId == null || this.cookId.isBlank()) {
            this.cookId = UUID.randomUUID().toString();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Constructors ────────────────────────────────────────
    public Cook() {}

    // ── Getters & Setters ───────────────────────────────────
    public String getCookId() { return cookId; }
    public void setCookId(String cookId) { this.cookId = cookId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPhoneCode() { return phoneCode; }
    public void setPhoneCode(String phoneCode) { this.phoneCode = phoneCode; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getKitchenName() { return kitchenName; }
    public void setKitchenName(String kitchenName) { this.kitchenName = kitchenName; }

    public List<String> getSpeciality() { return speciality; }
    public void setSpeciality(List<String> speciality) { this.speciality = speciality; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public String getCookMood() { return cookMood; }
    public void setCookMood(String cookMood) { this.cookMood = cookMood; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }

    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }

    public Integer getTotalDeliveries() { return totalDeliveries; }
    public void setTotalDeliveries(Integer totalDeliveries) { this.totalDeliveries = totalDeliveries; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
