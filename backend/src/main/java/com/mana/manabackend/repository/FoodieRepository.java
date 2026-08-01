package com.mana.manabackend.repository;

import com.mana.manabackend.model.Foodie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FoodieRepository extends JpaRepository<Foodie, String> {
    Optional<Foodie> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
}
