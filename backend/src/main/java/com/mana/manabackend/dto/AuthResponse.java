package com.mana.manabackend.dto;

public class AuthResponse {
    private String token;
    private String refreshToken;
    private String role;
    private String userId;
    private String name;
    private String email;
    private String message;

    private AuthResponse() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AuthResponse r = new AuthResponse();
        public Builder token(String v) { r.token = v; return this; }
        public Builder refreshToken(String v) { r.refreshToken = v; return this; }
        public Builder role(String v) { r.role = v; return this; }
        public Builder userId(String v) { r.userId = v; return this; }
        public Builder name(String v) { r.name = v; return this; }
        public Builder email(String v) { r.email = v; return this; }
        public Builder message(String v) { r.message = v; return this; }
        public AuthResponse build() { return r; }
    }

    public String getToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public String getRole() { return role; }
    public String getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getMessage() { return message; }
}
