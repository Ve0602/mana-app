package com.mana.manabackend.repository;

import com.mana.manabackend.model.Order;
import com.mana.manabackend.model.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByFoodieIdOrderByCreatedAtDesc(String foodieId);

    List<Order> findByCookIdOrderByCreatedAtDesc(String cookId);

    List<Order> findByCookIdAndStatus(String cookId, OrderStatus status);

    List<Order> findByCookIdAndStatusIn(String cookId, List<OrderStatus> statuses);

    @Query("SELECT o FROM Order o WHERE o.cookId = :cookId AND o.createdAt >= :from ORDER BY o.createdAt DESC")
    List<Order> findByCookIdSince(@Param("cookId") String cookId, @Param("from") LocalDateTime from);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.cookId = :cookId AND o.status = 'DELIVERED'")
    Long countDeliveredByCook(@Param("cookId") String cookId);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.cookId = :cookId " +
           "AND o.status = 'DELIVERED' AND o.createdAt >= :from")
    Long sumRevenueByCookSince(@Param("cookId") String cookId, @Param("from") LocalDateTime from);

    @Query("SELECT o FROM Order o WHERE o.foodieId = :foodieId AND o.status != 'DELIVERED' " +
           "AND o.status != 'CANCELLED' ORDER BY o.createdAt DESC")
    List<Order> findActiveOrdersByFoodie(@Param("foodieId") String foodieId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.cookId = :cookId " +
           "AND o.status IN ('PENDING','ACCEPTED','PREPARING','READY')")
    Long countActiveOrdersByCook(@Param("cookId") String cookId);
}
