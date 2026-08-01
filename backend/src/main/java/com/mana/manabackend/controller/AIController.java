package com.mana.manabackend.controller;

import com.mana.manabackend.model.Cook;
import com.mana.manabackend.model.Dish;
import com.mana.manabackend.repository.CookRepository;
import com.mana.manabackend.repository.DishRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ai")
public class AIController {

    private final CookRepository cookRepo;
    private final DishRepository dishRepo;
    private final RestTemplate   restTemplate;

    @Value("${mana.claude.api-key:}")
    private String claudeApiKey;

    @Value("${mana.claude.model:claude-sonnet-4-6}")
    private String claudeModel;

    public AIController(CookRepository cookRepo, DishRepository dishRepo) {
        this.cookRepo    = cookRepo;
        this.dishRepo    = dishRepo;
        this.restTemplate = new RestTemplate();
    }

    // ── AI meal matching ─────────────────────────────────────
    @PostMapping("/match-cooks")
    public ResponseEntity<?> matchCooks(@RequestBody Map<String, Object> body) {
        String goal = (String) body.getOrDefault("healthGoal", "");

        // Tag-based matching (works without Claude API key)
        List<Cook> allCooks = cookRepo.findTopRatedCooks();

        Map<String, List<String>> goalTagMap = Map.of(
            "lose-weight",   List.of("low-oil", "low-carb", "diabetic-friendly", "light"),
            "build-muscle",  List.of("high-protein", "non-veg"),
            "diabetic",      List.of("diabetic-friendly", "sugar-free", "low-carb"),
            "vegan",         List.of("vegan", "plant-based", "gluten-free"),
            "festive",       List.of("festive", "traditional", "biryani"),
            "light",         List.of("light", "tiffin", "low-oil")
        );

        List<String> targetTags = goalTagMap.getOrDefault(goal, List.of());

        // Score each cook based on how many matching dishes they have
        List<Map<String, Object>> scored = allCooks.stream().map(cook -> {
            List<Dish> cookDishes = dishRepo.findByCookIdAndIsAvailableTrue(cook.getCookId());
            long matchCount = cookDishes.stream()
                .filter(d -> d.getHealthTags() != null &&
                    d.getHealthTags().stream().anyMatch(targetTags::contains))
                .count();

            Map<String, Object> entry = new HashMap<>();
            entry.put("cook",       cook);
            entry.put("matchScore", matchCount);
            return entry;
        }).sorted((a, b) ->
            Long.compare((Long) b.get("matchScore"), (Long) a.get("matchScore"))
        ).collect(Collectors.toList());

        List<Cook> rankedCooks = scored.stream()
            .map(e -> (Cook) e.get("cook"))
            .collect(Collectors.toList());

        // Generate message
        String message = generateMatchMessage(goal, rankedCooks.size());

        // If Claude API key is set, enhance with AI explanation
        if (claudeApiKey != null && !claudeApiKey.isBlank() && !claudeApiKey.equals("")) {
            try {
                message = callClaude(buildMatchPrompt(goal, rankedCooks));
            } catch (Exception e) {
                // Fall back to static message
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("cooks",   rankedCooks);
        result.put("message", message);
        result.put("goal",    goal);
        result.put("count",   rankedCooks.size());
        return ResponseEntity.ok(result);
    }

    // ── AI smart search ──────────────────────────────────────
    @PostMapping("/search")
    public ResponseEntity<?> smartSearch(@RequestBody Map<String, Object> body) {
        String query    = (String) body.getOrDefault("query", "");
        String location = (String) body.getOrDefault("location", "");

        if (query.isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Search query is required"));
        }

        // Parse natural language query into search terms
        String normalised = query.toLowerCase();

        // Price extraction
        Integer maxPrice = null;
        if (normalised.contains("under ₹") || normalised.contains("under rs")) {
            try {
                String num = normalised.replaceAll(".*under [₹rs]+\\s*(\\d+).*", "$1");
                maxPrice   = Integer.parseInt(num.trim());
            } catch (Exception ignored) {}
        }

        // Health tag extraction
        Map<String, String> keywordToTag = Map.of(
            "diabetic",   "diabetic-friendly",
            "protein",    "high-protein",
            "vegan",      "vegan",
            "low calorie","low-carb",
            "healthy",    "low-oil",
            "gluten",     "gluten-free"
        );

        String detectedTag = keywordToTag.entrySet().stream()
            .filter(e -> normalised.contains(e.getKey()))
            .map(Map.Entry::getValue)
            .findFirst()
            .orElse(null);

        // Search dishes
        List<Dish> dishes;
        if (detectedTag != null) {
            dishes = dishRepo.findByHealthTag(detectedTag);
        } else {
            dishes = dishRepo.fullTextSearch(query);
        }

        // Apply price filter
        if (maxPrice != null) {
            final int mp = maxPrice;
            dishes = dishes.stream()
                .filter(d -> d.getPrice() != null && d.getPrice() <= mp)
                .collect(Collectors.toList());
        }

        // Search cooks too
        List<Cook> cooks = cookRepo.searchAvailableCooks(query);

        Map<String, Object> result = new HashMap<>();
        result.put("dishes",  dishes);
        result.put("cooks",   cooks);
        result.put("query",   query);
        result.put("count",   dishes.size() + cooks.size());
        return ResponseEntity.ok(result);
    }

    // ── AI nutrition analysis ────────────────────────────────
    @GetMapping("/nutrition/{dishId}")
    public ResponseEntity<?> nutritionAnalysis(@PathVariable String dishId) {
        Dish dish = dishRepo.findById(dishId).orElse(null);
        if (dish == null)
            return ResponseEntity.notFound().build();

        Map<String, Object> nutrition = new HashMap<>();
        nutrition.put("dishName",    dish.getDishName());
        nutrition.put("calories",    dish.getCalories());
        nutrition.put("protein",     dish.getProteinGrams());
        nutrition.put("healthScore", dish.getHealthScore());
        nutrition.put("healthTags",  dish.getHealthTags());
        nutrition.put("type",        dish.getType());

        // Generate AI insight if Claude key is set
        String insight = "This dish is " + dish.getType() + " and contains " +
            (dish.getCalories() != null ? dish.getCalories() + " calories." : "nutritional information not provided.");

        if (claudeApiKey != null && !claudeApiKey.isBlank()) {
            try {
                String prompt = "In 2 sentences, give a health insight about this dish: " +
                    dish.getDishName() + " (" + dish.getType() + ", " +
                    (dish.getCalories() != null ? dish.getCalories() + " cal, " : "") +
                    (dish.getProteinGrams() != null ? dish.getProteinGrams() + "g protein" : "") +
                    "). Tags: " + dish.getHealthTags() + ". Be specific and practical.";
                insight = callClaude(prompt);
            } catch (Exception e) { /* fallback */ }
        }

        nutrition.put("aiInsight", insight);
        return ResponseEntity.ok(nutrition);
    }

    // ── AI meal plan ─────────────────────────────────────────
    @PostMapping("/meal-plan")
    public ResponseEntity<?> mealPlan(@RequestBody Map<String, Object> body) {
        String goal = (String) body.getOrDefault("goal", "balanced");
        int    days = ((Number) body.getOrDefault("days", 7)).intValue();

        List<Dish> available = dishRepo.findTopRatedDishes();

        // Simple meal plan algorithm
        List<Map<String, Object>> plan = new ArrayList<>();
        String[] mealTypes = {"Breakfast", "Lunch", "Dinner"};
        Random rng = new Random();

        for (int day = 1; day <= Math.min(days, 7); day++) {
            Map<String, Object> dayPlan = new HashMap<>();
            dayPlan.put("day", day);
            List<Map<String, Object>> meals = new ArrayList<>();

            for (String mealType : mealTypes) {
                List<Dish> options = available.stream()
                    .filter(d -> {
                        if (mealType.equals("Breakfast"))
                            return "Breakfast".equals(d.getCategory()) || "Tiffin".equals(d.getCategory());
                        if (mealType.equals("Dinner"))
                            return "Main Course".equals(d.getCategory());
                        return true;
                    })
                    .collect(Collectors.toList());

                if (!options.isEmpty()) {
                    Dish pick = options.get(rng.nextInt(options.size()));
                    Map<String, Object> meal = new HashMap<>();
                    meal.put("type",   mealType);
                    meal.put("dish",   pick.getDishName());
                    meal.put("dishId", pick.getDishId());
                    meal.put("price",  pick.getPrice());
                    meal.put("cal",    pick.getCalories());
                    meals.add(meal);
                }
            }
            dayPlan.put("meals", meals);
            plan.add(dayPlan);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("goal",    goal);
        result.put("days",    days);
        result.put("plan",    plan);
        result.put("message", "Your personalised " + days + "-day meal plan for " + goal + " is ready!");
        return ResponseEntity.ok(result);
    }

    // ── Claude API helper ────────────────────────────────────
    private String callClaude(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", claudeApiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model",      claudeModel);
        requestBody.put("max_tokens", 300);
        requestBody.put("messages",   List.of(
            Map.of("role", "user", "content", prompt)
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            "https://api.anthropic.com/v1/messages",
            entity,
            Map.class
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content =
                (List<Map<String, Object>>) response.getBody().get("content");
            if (content != null && !content.isEmpty()) {
                return (String) content.get(0).get("text");
            }
        }
        throw new RuntimeException("Claude API returned no content");
    }

    private String buildMatchPrompt(String goal, List<Cook> cooks) {
        int count = cooks.size();
        return "Write ONE sentence (max 15 words) telling a user we found " + count +
            " home cooks matching their '" + goal + "' health goal. Be warm and encouraging.";
    }

    private String generateMatchMessage(String goal, int count) {
        Map<String, String> messages = Map.of(
            "lose-weight",  "Found " + count + " cooks specialising in healthy, low-oil meals for your weight loss goal!",
            "build-muscle", "Found " + count + " cooks with high-protein meals to fuel your muscle-building journey!",
            "diabetic",     "Found " + count + " cooks offering diabetic-friendly, controlled-sugar meals.",
            "vegan",        "Found " + count + " amazing plant-based home cooks near you!",
            "festive",      "Found " + count + " master cooks ready to make your celebration special!",
            "light",        "Found " + count + " cooks serving light, easy-to-digest tiffin meals!"
        );
        return messages.getOrDefault(goal, "Found " + count + " great home cooks for you!");
    }
}
