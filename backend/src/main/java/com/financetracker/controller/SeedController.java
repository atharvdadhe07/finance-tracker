package com.financetracker.controller;

import com.financetracker.service.SeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class SeedController {

    private final SeedService seedService;

    @PostMapping
    public ResponseEntity<Map<String, String>> seed() {
        int seededCount = seedService.seed();
        return ResponseEntity.ok(Map.of("message", "Seeded " + seededCount + " transactions"));
    }
}
