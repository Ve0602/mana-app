package com.mana.manabackend.repository;

import com.mana.manabackend.model.Cook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CookRepository extends JpaRepository<Cook, String> {

    Optional<Cook> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Cook> findByCity(String city);

    List<Cook> findByCityAndIsAvailableTrue(String city);

    List<Cook> findByPincodeAndIsAvailableTrue(String pincode);

    @Query("SELECT c FROM Cook c WHERE c.isAvailable = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.kitchenName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Cook> searchAvailableCooks(@Param("query") String query);

    @Query("SELECT c FROM Cook c WHERE c.isAvailable = true ORDER BY c.avgRating DESC")
    List<Cook> findTopRatedCooks();

    @Query("SELECT c FROM Cook c WHERE c.city = :city AND c.isAvailable = true ORDER BY c.avgRating DESC")
    List<Cook> findTopRatedCooksByCity(@Param("city") String city);
}
