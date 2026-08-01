package com.mana.manabackend.repository;

import com.mana.manabackend.model.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, String> {

    List<Dish> findByCookId(String cookId);

    List<Dish> findByCookIdAndIsAvailableTrue(String cookId);

    List<Dish> findByCategory(String category);

    List<Dish> findByType(String type); // Veg, Non-Veg, Vegan

    @Query("SELECT d FROM Dish d WHERE d.isAvailable = true AND " +
           "LOWER(d.dishName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Dish> searchByName(@Param("query") String query);

    @Query("SELECT d FROM Dish d WHERE d.isAvailable = true AND " +
           "d.price BETWEEN :minPrice AND :maxPrice")
    List<Dish> findByPriceRange(@Param("minPrice") int min, @Param("maxPrice") int max);

    @Query("SELECT d FROM Dish d WHERE d.isAvailable = true ORDER BY d.avgRating DESC")
    List<Dish> findTopRatedDishes();

    @Query("SELECT d FROM Dish d JOIN d.healthTags t WHERE t = :tag AND d.isAvailable = true")
    List<Dish> findByHealthTag(@Param("tag") String tag);

    @Query("SELECT d FROM Dish d WHERE d.cookId = :cookId AND d.isAvailable = true " +
           "ORDER BY d.totalOrders DESC")
    List<Dish> findBestsellersByCook(@Param("cookId") String cookId);

    @Query("SELECT d FROM Dish d WHERE d.isAvailable = true AND " +
           "(LOWER(d.dishName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(d.description) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(d.category) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Dish> fullTextSearch(@Param("q") String query);
}
