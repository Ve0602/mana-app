package com.mana.manabackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "dishes", indexes = {
    @Index(name = "idx_dish_cook_id", columnList = "cook_id"),
    @Index(name = "idx_dish_category", columnList = "category"),
    @Index(name = "idx_dish_available", columnList = "is_available"),
    @Index(name = "idx_dish_price", columnList = "price")
})
public class Dish {

    @Id
    @Column(name = "dish_id", nullable = false, updatable = false, length = 36)
    private String dishId;

    @NotBlank(message = "Cook ID is required")
    @Column(name = "cook_id", nullable = false, length = 36)
    private String cookId;

    @NotBlank(message = "Kitchen name is required")
    @Column(name = "kitchen_name", nullable = false, length = 150)
    private String kitchenName;

    @NotBlank(message = "Dish name is required")
    @Size(min = 2, max = 150)
    @Column(name = "dish_name", nullable = false, length = 150)
    private String dishName;

    @Size(max = 1000)
    @Column(name = "description", length = 1000)
    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 1, message = "Price must be at least ₹1")
    @Max(value = 10000, message = "Price cannot exceed ₹10,000")
    @Column(nullable = false)
    private Integer price;

    @NotBlank(message = "Category is required")
    @Column(nullable = false, length = 100)
    private String category;  // Breakfast, Main Course, Snacks, Desserts, Beverages

    @NotBlank(message = "Type is required")
    @Column(nullable = false, length = 50)
    private String type;      // Veg, Non-Veg, Vegan, Egg

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // ── Nutrition & AI health tags ─────────────────────────
    @Column(name = "calories")
    private Integer calories;

    @Column(name = "protein_grams")
    private Double proteinGrams;

    @Column(name = "health_score")
    private Integer healthScore;  // 1-10 AI-computed

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "dish_health_tags",
        joinColumns = @JoinColumn(name = "dish_id"))
    @Column(name = "tag", length = 50)
    private List<String> healthTags = new ArrayList<>();
    // e.g. diabetic-friendly, high-protein, low-oil, vegan, gluten-free

    // ── Ratings ─────────────────────────────────────────────
    @Column(name = "avg_rating")
    private Double avgRating = 0.0;

    @Column(name = "total_orders")
    private Integer totalOrders = 0;

    // ── Timestamps ─────────────────────────────────────────
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.dishId == null || this.dishId.isBlank()) {
            this.dishId = UUID.randomUUID().toString();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Dish() {}

    // ── Getters & Setters ───────────────────────────────────
    public String getDishId() { return dishId; }
    public void setDishId(String dishId) { this.dishId = dishId; }

    public String getCookId() { return cookId; }
    public void setCookId(String cookId) { this.cookId = cookId; }

    public String getKitchenName() { return kitchenName; }
    public void setKitchenName(String kitchenName) { this.kitchenName = kitchenName; }

    public String getDishName() { return dishName; }
    public void setDishName(String dishName) { this.dishName = dishName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getCalories() { return calories; }
    public void setCalories(Integer calories) { this.calories = calories; }

    public Double getProteinGrams() { return proteinGrams; }
    public void setProteinGrams(Double proteinGrams) { this.proteinGrams = proteinGrams; }

    public Integer getHealthScore() { return healthScore; }
    public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }

    public List<String> getHealthTags() { return healthTags; }
    public void setHealthTags(List<String> healthTags) { this.healthTags = healthTags; }

    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }

    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
