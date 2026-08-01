package com.mana.manabackend.dto;

import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;

public class RegisterCookRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank @Email
    private String email;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    @NotBlank
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode")
    private String pincode;

    @NotBlank
    private String state;

    private String phoneCode = "+91";

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number")
    private String phoneNumber;

    @NotBlank
    private String kitchenName;

    private List<String> speciality = new ArrayList<>();

    @Size(max = 500)
    private String bio;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPhoneCode() { return phoneCode; }
    public void setPhoneCode(String phoneCode) { this.phoneCode = phoneCode; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getKitchenName() { return kitchenName; }
    public void setKitchenName(String kitchenName) { this.kitchenName = kitchenName; }
    public List<String> getSpeciality() { return speciality; }
    public void setSpeciality(List<String> speciality) { this.speciality = speciality; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
