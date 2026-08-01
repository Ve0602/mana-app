package com.mana.manabackend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @Column(name = "item_id", nullable = false, updatable = false, length = 36)
    private String itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "dish_id", nullable = false, length = 36)
    private String dishId;

    @Column(name = "dish_name", nullable = false, length = 150)
    private String dishName;

    @Column(name = "unit_price", nullable = false)
    private Integer unitPrice;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "subtotal", nullable = false)
    private Integer subtotal;

    @Column(name = "special_note", length = 255)
    private String specialNote;

    @PrePersist
    protected void onCreate() {
        if (this.itemId == null || this.itemId.isBlank()) {
            this.itemId = UUID.randomUUID().toString();
        }
        this.subtotal = this.unitPrice * this.quantity;
    }

    public OrderItem() {}

    public OrderItem(Order order, String dishId, String dishName, Integer unitPrice, Integer quantity) {
        this.order = order;
        this.dishId = dishId;
        this.dishName = dishName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.subtotal = unitPrice * quantity;
    }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public String getDishId() { return dishId; }
    public void setDishId(String dishId) { this.dishId = dishId; }
    public String getDishName() { return dishName; }
    public void setDishName(String dishName) { this.dishName = dishName; }
    public Integer getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Integer unitPrice) { this.unitPrice = unitPrice; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Integer getSubtotal() { return subtotal; }
    public void setSubtotal(Integer subtotal) { this.subtotal = subtotal; }
    public String getSpecialNote() { return specialNote; }
    public void setSpecialNote(String specialNote) { this.specialNote = specialNote; }
}
