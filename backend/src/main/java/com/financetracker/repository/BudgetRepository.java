package com.financetracker.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.BudgetResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Slf4j
@Repository
@RequiredArgsConstructor
public class BudgetRepository {

    public static final String KEY = "budget:monthly";

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public BudgetResponse get() {
        String json = stringRedisTemplate.opsForValue().get(KEY);
        if (json == null || json.isBlank()) {
            return BudgetResponse.builder()
                    .amount(BigDecimal.ZERO)
                    .currency("USD")
                    .build();
        }
        try {
            return objectMapper.readValue(json, BudgetResponse.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse budget json from Redis: {}", json, e);
            return BudgetResponse.builder()
                    .amount(BigDecimal.ZERO)
                    .currency("USD")
                    .build();
        }
    }

    public void save(BudgetResponse budget) {
        try {
            String json = objectMapper.writeValueAsString(budget);
            stringRedisTemplate.opsForValue().set(KEY, json);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize budget object to JSON", e);
            throw new RuntimeException("Failed to serialize budget", e);
        }
    }
}
