package com.mana.manabackend.controller;

import com.mana.manabackend.exception.BusinessException;
import com.mana.manabackend.exception.ResourceNotFoundException;
import com.mana.manabackend.model.Order;
import com.mana.manabackend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Razorpay Payment Controller
 *
 * Flow:
 *  1. POST /api/v1/payments/create-order  — creates Razorpay order
 *  2. Frontend opens Razorpay checkout
 *  3. POST /api/v1/payments/verify        — verifies signature, marks order paid
 *
 * To enable: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in application.properties
 */
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final OrderRepository orderRepo;

    @Value("${mana.razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${mana.razorpay.key-secret:}")
    private String razorpayKeySecret;

    public PaymentController(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    // ── Create Razorpay order ────────────────────────────────
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        String orderId = (String) body.get("orderId");

        Order manaOrder = orderRepo.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        int amountPaise = manaOrder.getFinalAmount() * 100; // Razorpay uses paise

        // In production: call Razorpay API to create an order
        // For now, return a mock response that the frontend can use
        // Replace with actual Razorpay Java SDK call:
        //
        // RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        // JSONObject orderRequest = new JSONObject();
        // orderRequest.put("amount", amountPaise);
        // orderRequest.put("currency", "INR");
        // orderRequest.put("receipt", "mana_" + orderId);
        // com.razorpay.Order rzpOrder = client.orders.create(orderRequest);

        String mockRzpOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        // Store Razorpay order ID on the mana order
        manaOrder.setRazorpayOrderId(mockRzpOrderId);
        orderRepo.save(manaOrder);

        Map<String, Object> response = new HashMap<>();
        response.put("razorpayOrderId", mockRzpOrderId);
        response.put("amount",          amountPaise);
        response.put("currency",        "INR");
        response.put("keyId",           razorpayKeyId);
        response.put("orderId",         orderId);
        response.put("prefill", Map.of(
            "name",    manaOrder.getFoodieName(),
            "contact", ""
        ));

        return ResponseEntity.ok(response);
    }

    // ── Verify payment signature ─────────────────────────────
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, String> body,
            Authentication auth) {

        String razorpayOrderId   = body.get("razorpayOrderId");
        String razorpayPaymentId = body.get("razorpayPaymentId");
        String razorpaySignature = body.get("razorpaySignature");
        String manaOrderId       = body.get("orderId");

        // Verify HMAC signature
        boolean valid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (!valid) {
            throw new BusinessException("Payment verification failed — invalid signature");
        }

        // Mark order as paid
        Order order = orderRepo.findById(manaOrderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", manaOrderId));

        order.setRazorpayPaymentId(razorpayPaymentId);
        order.setPaymentStatus("PAID");
        orderRepo.save(order);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Payment verified successfully",
            "orderId", manaOrderId
        ));
    }

    // ── HMAC-SHA256 signature verification ───────────────────
    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"
            );
            mac.init(secretKey);
            byte[] hash  = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String computed = bytesToHex(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
