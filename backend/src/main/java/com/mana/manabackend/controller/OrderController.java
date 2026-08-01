package com.mana.manabackend.controller;

import com.mana.manabackend.exception.BusinessException;
import com.mana.manabackend.exception.ResourceNotFoundException;
import com.mana.manabackend.model.Order;
import com.mana.manabackend.model.Order.OrderStatus;
import com.mana.manabackend.model.OrderItem;
import com.mana.manabackend.repository.CookRepository;
import com.mana.manabackend.repository.FoodieRepository;
import com.mana.manabackend.repository.OrderRepository;
import com.mana.manabackend.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderRepository   orderRepo;
    private final CookRepository    cookRepo;
    private final FoodieRepository  foodieRepo;
    private final JwtUtil           jwtUtil;

    public OrderController(OrderRepository orderRepo,
                           CookRepository cookRepo,
                           FoodieRepository foodieRepo,
                           JwtUtil jwtUtil) {
        this.orderRepo  = orderRepo;
        this.cookRepo   = cookRepo;
        this.foodieRepo = foodieRepo;
        this.jwtUtil    = jwtUtil;
    }

    // ── Place order ──────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> placeOrder(
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        String email  = auth.getName();
        var foodie    = foodieRepo.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Foodie not found"));

        String cookId       = (String) body.get("cookId");
        String kitchenName  = (String) body.getOrDefault("kitchenName", "");
        String address      = (String) body.get("deliveryAddress");
        String pincode      = (String) body.getOrDefault("deliveryPincode", "");
        String payMethod    = (String) body.getOrDefault("paymentMethod", "COD");
        String specialNote  = (String) body.getOrDefault("specialInstructions", "");
        Integer finalAmt    = (Integer) body.getOrDefault("finalAmount", 0);
        Integer totalAmt    = (Integer) body.getOrDefault("totalAmount", finalAmt);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsRaw =
            (List<Map<String, Object>>) body.get("items");

        if (cookId == null || cookId.isBlank())
            throw new BusinessException("Cook ID is required");
        if (address == null || address.isBlank())
            throw new BusinessException("Delivery address is required");
        if (itemsRaw == null || itemsRaw.isEmpty())
            throw new BusinessException("Order must have at least one item");

        cookRepo.findById(cookId)
            .orElseThrow(() -> new ResourceNotFoundException("Cook", cookId));

        Order order = new Order();
        order.setFoodieId(foodie.getFoodieId());
        order.setFoodieName(foodie.getName());
        order.setCookId(cookId);
        order.setKitchenName(kitchenName);
        order.setDeliveryAddress(address);
        order.setDeliveryPincode(pincode);
        order.setPaymentMethod(payMethod);
        order.setSpecialInstructions(specialNote);
        order.setTotalAmount(totalAmt);
        order.setDiscountAmount(0);
        order.setFinalAmount(finalAmt);
        order.setStatus(OrderStatus.PENDING);

        // Estimated delivery: 45 minutes from now
        order.setEstimatedDeliveryTime(LocalDateTime.now().plusMinutes(45));

        Order saved = orderRepo.save(order);

        // Add items
        for (Map<String, Object> item : itemsRaw) {
            OrderItem oi = new OrderItem();
            oi.setOrder(saved);
            oi.setDishId((String) item.get("dishId"));
            oi.setDishName((String) item.get("dishName"));
            oi.setUnitPrice(((Number) item.get("unitPrice")).intValue());
            oi.setQuantity(((Number) item.get("quantity")).intValue());
            oi.setSubtotal(oi.getUnitPrice() * oi.getQuantity());
            saved.getItems().add(oi);
        }

        Order complete = orderRepo.save(saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(complete);
    }

    // ── Get order by ID ──────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id, Authentication auth) {
        Order order = orderRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        String email = auth.getName();
        boolean isFoodie = foodieRepo.findByEmail(email)
            .map(f -> f.getFoodieId().equals(order.getFoodieId()))
            .orElse(false);
        boolean isCook = cookRepo.findByEmail(email)
            .map(c -> c.getCookId().equals(order.getCookId()))
            .orElse(false);

        if (!isFoodie && !isCook)
            throw new BusinessException("You don't have access to this order");

        return ResponseEntity.ok(order);
    }

    // ── Foodie: my orders ────────────────────────────────────
    @GetMapping("/my-orders")
    public ResponseEntity<?> myOrders(Authentication auth) {
        String email = auth.getName();
        var foodie   = foodieRepo.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Foodie not found"));
        return ResponseEntity.ok(
            orderRepo.findByFoodieIdOrderByCreatedAtDesc(foodie.getFoodieId())
        );
    }

    // ── Foodie: active orders ────────────────────────────────
    @GetMapping("/active")
    public ResponseEntity<?> activeOrders(Authentication auth) {
        String email = auth.getName();
        var foodie   = foodieRepo.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Foodie not found"));
        return ResponseEntity.ok(
            orderRepo.findActiveOrdersByFoodie(foodie.getFoodieId())
        );
    }

    // ── Cook: order queue ────────────────────────────────────
    @GetMapping("/cook/queue")
    public ResponseEntity<?> cookQueue(Authentication auth) {
        String email = auth.getName();
        var cook     = cookRepo.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Cook not found"));
        return ResponseEntity.ok(
            orderRepo.findByCookIdOrderByCreatedAtDesc(cook.getCookId())
        );
    }

    // ── Update order status ──────────────────────────────────
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication auth) {

        Order order = orderRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        String email = auth.getName();
        cookRepo.findByEmail(email)
            .filter(c -> c.getCookId().equals(order.getCookId()))
            .orElseThrow(() -> new BusinessException("Only the cook can update order status"));

        String newStatus = body.get("status");
        try {
            OrderStatus status = OrderStatus.valueOf(newStatus);
            order.setStatus(status);
            if (status == OrderStatus.ACCEPTED)  order.setAcceptedAt(LocalDateTime.now());
            if (status == OrderStatus.DELIVERED) order.setDeliveredAt(LocalDateTime.now());
            return ResponseEntity.ok(orderRepo.save(order));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + newStatus);
        }
    }

    // ── Cancel order ─────────────────────────────────────────
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String id, Authentication auth) {
        Order order = orderRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        if (!order.getStatus().equals(OrderStatus.PENDING))
            throw new BusinessException("Only pending orders can be cancelled");

        order.setStatus(OrderStatus.CANCELLED);
        return ResponseEntity.ok(orderRepo.save(order));
    }

    // ── Rate order ───────────────────────────────────────────
    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rateOrder(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        Order order = orderRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        if (!order.getStatus().equals(OrderStatus.DELIVERED))
            throw new BusinessException("Can only rate delivered orders");

        int rating = ((Number) body.get("rating")).intValue();
        if (rating < 1 || rating > 5)
            throw new BusinessException("Rating must be between 1 and 5");

        order.setRating(rating);
        order.setReview((String) body.getOrDefault("review", ""));

        // Update cook's average rating
        cookRepo.findById(order.getCookId()).ifPresent(cook -> {
            List<Order> cookOrders = orderRepo.findByCookIdOrderByCreatedAtDesc(cook.getCookId());
            double avg = cookOrders.stream()
                .filter(o -> o.getRating() != null)
                .mapToInt(Order::getRating)
                .average()
                .orElse(0.0);
            cook.setAvgRating(Math.round(avg * 10.0) / 10.0);
            cook.setTotalReviews((int) cookOrders.stream().filter(o -> o.getRating() != null).count());
            cookRepo.save(cook);
        });

        return ResponseEntity.ok(orderRepo.save(order));
    }
}
