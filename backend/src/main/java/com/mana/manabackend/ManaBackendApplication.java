package com.mana.manabackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ManaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ManaBackendApplication.class, args);
    }

    /**
     * Serve uploaded images at /uploads/**
     * In production, replace with CDN (Cloudinary, AWS S3 + CloudFront)
     */
    @Bean
    public WebMvcConfigurer staticResourceConfigurer(
            @Value("${mana.upload.dir:uploads/}") String uploadDir) {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                String location = uploadDir.startsWith("/")
                    ? "file:" + uploadDir
                    : "file:./" + uploadDir;

                registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(location)
                    .setCachePeriod(86400); // 1 day cache
            }
        };
    }
}
