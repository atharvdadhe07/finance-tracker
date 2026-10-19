package com.financetracker.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Repository
@RequiredArgsConstructor
public class CategoryRepository {

    public static final String KEY = "categories";
    public static final List<String> DEFAULT_CATEGORIES = List.of(
            "Food", "Transport", "Rent", "Bills", "Shopping", "Health", "Entertainment", "Salary", "Other"
    );

    private final StringRedisTemplate stringRedisTemplate;

    public Set<String> findAll() {
        Set<String> categories = stringRedisTemplate.opsForSet().members(KEY);
        return categories != null ? categories : Collections.emptySet();
    }

    public void add(String category) {
        if (category != null && !category.isBlank()) {
            stringRedisTemplate.opsForSet().add(KEY, category.trim());
        }
    }

    public void initDefaults() {
        stringRedisTemplate.opsForSet().add(KEY, DEFAULT_CATEGORIES.toArray(new String[0]));
    }
}
