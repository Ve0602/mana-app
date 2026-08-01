package com.mana.manabackend.services;

import com.mana.manabackend.model.Order;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Broadcasts real-time order status updates via WebSocket.
 *
 * Topics:
 *  /topic/cook/{cookId}/orders      — cook dashboard live updates
 *  /topic/order/{orderId}           — foodie order tracking
 */
@Service
public class OrderWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public OrderWebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Notify both the cook and the foodie when an order status changes.
     */
    public void broadcastOrderUpdate(Order order) {
        Map<String, Object> payload = Map.of(
            "orderId",   order.getOrderId(),
            "status",    order.getStatus().name(),
            "cookId",    order.getCookId(),
            "foodieId",  order.getFoodieId(),
            "updatedAt", order.getUpdatedAt() != null
                ? order.getUpdatedAt().toString() : ""
        );

        // Notify the cook's dashboard
        messagingTemplate.convertAndSend(
            "/topic/cook/" + order.getCookId() + "/orders",
            payload
        );

        // Notify the foodie's order tracking screen
        messagingTemplate.convertAndSend(
            "/topic/order/" + order.getOrderId(),
            payload
        );
    }

    /**
     * Notify a cook about a new incoming order.
     */
    public void notifyNewOrder(Order order) {
        Map<String, Object> payload = Map.of(
            "type",      "NEW_ORDER",
            "orderId",   order.getOrderId(),
            "foodieName",order.getFoodieName(),
            "amount",    order.getFinalAmount(),
            "items",     order.getItems().size()
        );

        messagingTemplate.convertAndSend(
            "/topic/cook/" + order.getCookId() + "/orders",
            payload
        );
    }
}
