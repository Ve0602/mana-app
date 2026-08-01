# 🍱 MANA — Taste of Home
### AI-powered home-cooked food marketplace

---

## What is Mana?

Mana connects home cooks with people who want real, home-cooked food delivered to their door. Unlike Zomato or Swiggy, every meal on Mana is prepared in a real home kitchen — fresh, personal, and made with love.

**Differentiators:**
- 🤖 AI goal-based meal matching (diabetic, vegan, high-protein, etc.)
- 👩‍🍳 Cook story cards with live mood status
- 📅 Subscription meal plans (Trial / Weekly / Monthly)
- 🌱 Health tags on every dish (calories, protein, dietary flags)
- 🔴 Real-time order tracking (WebSocket-ready)

---

## Architecture

```
mana/
├── frontend/          React 18 + React Router v6
│   └── src/
│       ├── pages/     All page components
│       ├── components/ Navbar, CookCard, AISearchBar, etc.
│       ├── context/   AuthContext, CartContext
│       ├── services/  authService, cookService, etc.
│       └── styles/    Global CSS design system + page styles
│
└── backend/           Spring Boot 3.2 + MySQL + JPA
    └── src/main/java/com/mana/manabackend/
        ├── model/     Cook, Foodie, Dish, Order, OrderItem
        ├── repository/ JPA repositories with custom queries
        ├── controller/ Auth, Cooks, Dishes, Orders, Foodies
        ├── services/  FileUploadService
        ├── security/  JWT, Spring Security, UserDetailsService
        ├── exception/ GlobalExceptionHandler, custom exceptions
        ├── dto/       Auth/Register request/response DTOs
        └── config/    SecurityConfig (CORS + JWT filter chain)
```

---

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

---

### Backend Setup

```bash
# 1. Create MySQL database
mysql -u root -p
CREATE DATABASE mana_db;
EXIT;

# 2. Configure environment
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT secret

# 3. Run Spring Boot
./mvnw spring-boot:run
# API runs at http://localhost:8080
```

**Required environment variables (backend):**
```
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_base64_encoded_256_bit_secret
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret
CLAUDE_API_KEY=sk-ant-...         # optional, for AI features
UPLOAD_DIR=uploads/               # where images are stored locally
```

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

---

### Frontend Setup

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Configure environment
cp .env.example .env
# REACT_APP_API_URL is already set to http://localhost:8080/api/v1

# 3. Start React app
npm start
# App runs at http://localhost:3000
```

---

## API Endpoints

### Auth (public)
```
POST /api/v1/auth/cook/register     Register as a cook
POST /api/v1/auth/foodie/register   Register as a foodie
POST /api/v1/auth/login             Login (cook or foodie)
```

### Cooks (GET public, mutations authenticated)
```
GET    /api/v1/cooks                       List all cooks
GET    /api/v1/cooks/top-rated             Top rated cooks
GET    /api/v1/cooks/{id}                  Get cook by ID
PUT    /api/v1/cooks/{id}                  Update cook profile
PATCH  /api/v1/cooks/{id}/availability     Toggle availability
PATCH  /api/v1/cooks/{id}/mood             Update cook mood
POST   /api/v1/cooks/{id}/image            Upload profile image
```

### Dishes (GET public, mutations authenticated)
```
GET    /api/v1/dishes/cook/{cookId}        Get dishes by cook
GET    /api/v1/dishes/{id}                 Get dish by ID
GET    /api/v1/dishes/search?q=...         Search dishes
GET    /api/v1/dishes/health/{tag}         Filter by health tag
POST   /api/v1/dishes                      Create dish (cook only)
PUT    /api/v1/dishes/{id}                 Update dish (cook only)
PATCH  /api/v1/dishes/{id}/availability    Toggle dish availability
POST   /api/v1/dishes/{id}/image           Upload dish image
DELETE /api/v1/dishes/{id}                 Delete dish
```

### Orders (all authenticated)
```
POST   /api/v1/orders                      Place order
GET    /api/v1/orders/{id}                 Get order by ID
GET    /api/v1/orders/my-orders            Foodie: my order history
GET    /api/v1/orders/active               Foodie: active orders
GET    /api/v1/orders/cook/queue           Cook: order queue
PATCH  /api/v1/orders/{id}/status          Cook: update status
PATCH  /api/v1/orders/{id}/cancel          Cancel order
POST   /api/v1/orders/{id}/rate            Rate a delivered order
```

---

## User Flows

### Foodie flow
1. Register → select health goal + diet type
2. Browse home cooks (AI-matched or manual filter)
3. View cook profile → browse menu → add to cart
4. Checkout → enter address → pay → order placed
5. Track order live → rate after delivery

### Cook flow
1. Register → set kitchen name + specialities + bio
2. Add dishes with health tags, calories, images
3. Go online (toggle availability)
4. Accept orders → mark preparing → mark ready → out for delivery
5. View earnings dashboard

---

## Design System

- **Fonts:** Playfair Display (headings) + Plus Jakarta Sans (body) + DM Mono (code)
- **Primary:** `#e85d26` (Mana orange)
- **Secondary:** `#2d7a4f` (Mana green)
- **8-point spacing grid**
- **Fully responsive** — works on mobile, tablet, desktop
- **CSS custom properties** for easy theming + dark mode ready

---

## What was fixed from the original 20% project

| Issue | Fix |
|-------|-----|
| Passwords stored in plaintext | BCrypt with strength 12 |
| No CORS → frontend can't call API | Spring Security CORS config |
| String IDs with no generation | UUID @PrePersist auto-generation |
| `List<String>` without @ElementCollection | Fixed with @ElementCollection on speciality + health tags |
| Search input type="email" | Fixed to type="text" |
| No input validation | @Valid + Bean Validation on all DTOs |
| No error handling (stack traces) | GlobalExceptionHandler with clean JSON errors |
| No auth at all | Full JWT + Spring Security filter chain |
| No Order system | Complete Order + OrderItem models + controller |
| No React routing | React Router v6 with protected routes |
| No cart | CartContext with localStorage persistence |
| Footer shows "Scanfcode 2017" | Replaced with Mana branding |

---

## Phase Roadmap

| Phase | Status | What |
|-------|--------|------|
| 1 — Bug fixes | ✅ Done | Security, CORS, UUID, validation |
| 2 — Auth | ✅ Done | JWT, Spring Security, login/register pages |
| 3 — Core pages | ✅ Done | React routing, all 15 pages |
| 4 — Orders | ✅ Done | Place order, tracking, cook queue |
| 5 — AI features | 🔜 Next | Claude API meal matching, smart search |
| 6 — Real-time | 🔜 Next | WebSocket live order updates |
| 7 — Payments | 🔜 Next | Razorpay UPI + cards |
| 8 — Deploy | 🔜 Next | Docker + CI/CD |
