package com.mana.manabackend.security;

import com.mana.manabackend.repository.CookRepository;
import com.mana.manabackend.repository.FoodieRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ManaUserDetailsService implements UserDetailsService {

    private final CookRepository cookRepository;
    private final FoodieRepository foodieRepository;

    public ManaUserDetailsService(CookRepository cookRepository,
                                   FoodieRepository foodieRepository) {
        this.cookRepository = cookRepository;
        this.foodieRepository = foodieRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try cook first
        var cook = cookRepository.findByEmail(email);
        if (cook.isPresent()) {
            return User.builder()
                .username(cook.get().getEmail())
                .password(cook.get().getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_COOK")))
                .build();
        }

        // Try foodie
        var foodie = foodieRepository.findByEmail(email);
        if (foodie.isPresent()) {
            return User.builder()
                .username(foodie.get().getEmail())
                .password(foodie.get().getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_FOODIE")))
                .build();
        }

        throw new UsernameNotFoundException("No user found with email: " + email);
    }
}
