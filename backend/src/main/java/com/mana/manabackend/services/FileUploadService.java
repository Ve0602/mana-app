package com.mana.manabackend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${mana.upload.dir:uploads/}")
    private String uploadDir;

    // Allowed image types
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    /**
     * Upload a file and return a URL path.
     * In production, replace with Cloudinary or AWS S3 upload.
     *
     * @param file   multipart file from request
     * @param folder subfolder e.g. "cooks/uuid" or "dishes/uuid"
     * @return relative URL to the uploaded file
     */
    public String upload(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("File is empty");

        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new IllegalArgumentException("Only JPG, PNG and WEBP images are allowed");

        if (file.getSize() > MAX_SIZE)
            throw new IllegalArgumentException("File size must not exceed 5 MB");

        // Get extension
        String original = file.getOriginalFilename() != null
            ? file.getOriginalFilename() : "image.jpg";
        String ext = original.contains(".")
            ? original.substring(original.lastIndexOf('.'))
            : ".jpg";

        // Generate unique filename
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;

        // Create directory
        Path dir = Paths.get(uploadDir, folder);
        Files.createDirectories(dir);

        // Save file
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // Return URL path (serve via /uploads/** in prod or CDN)
        return "/uploads/" + folder + "/" + filename;
    }

    /**
     * Delete a file by its URL path.
     */
    public void delete(String urlPath) {
        if (urlPath == null || urlPath.isBlank()) return;
        try {
            String relativePath = urlPath.startsWith("/uploads/")
                ? urlPath.substring("/uploads/".length())
                : urlPath;
            Path file = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            // Log but don't throw — file deletion is non-critical
            System.err.println("Warning: could not delete file: " + urlPath);
        }
    }
}
