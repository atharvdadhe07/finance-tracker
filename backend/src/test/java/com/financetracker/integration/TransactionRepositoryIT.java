package com.financetracker.integration;

import com.financetracker.model.Transaction;
import com.financetracker.model.TransactionType;
import com.financetracker.repository.TransactionRepository;
import com.redis.testcontainers.RedisContainer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Testcontainers
class TransactionRepositoryIT {

    @Container
    private static final RedisContainer REDIS = new RedisContainer(
            DockerImageName.parse("redis:7.2.4")
    );

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", REDIS::getFirstMappedPort);
    }

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @AfterEach
    void cleanUp() {
        if (stringRedisTemplate.getConnectionFactory() != null) {
            try (RedisConnection connection = stringRedisTemplate.getConnectionFactory().getConnection()) {
                connection.serverCommands().flushDb();
            }
        }
    }

    @Test
    void testSaveAndFindByIdRoundTripsCorrectly() {
        String id = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);

        Transaction txn = Transaction.builder()
                .id(id)
                .amount(new BigDecimal("250.75"))
                .type(TransactionType.EXPENSE)
                .category("Food")
                .date(LocalDate.of(2026, 5, 10))
                .note("Team dinner")
                .createdAt(now)
                .updatedAt(now)
                .build();

        transactionRepository.save(txn);

        Optional<Transaction> retrieved = transactionRepository.findById(id);
        assertTrue(retrieved.isPresent());
        Transaction found = retrieved.get();

        assertEquals(txn.getId(), found.getId());
        assertEquals(txn.getAmount(), found.getAmount());
        assertEquals(txn.getType(), found.getType());
        assertEquals(txn.getCategory(), found.getCategory());
        assertEquals(txn.getDate(), found.getDate());
        assertEquals(txn.getNote(), found.getNote());
        assertEquals(txn.getCreatedAt(), found.getCreatedAt());
        assertEquals(txn.getUpdatedAt(), found.getUpdatedAt());
    }

    @Test
    void testZRangeByScoreDateRangeReturnsCorrectIds() {
        Transaction txn1 = Transaction.builder()
                .id("txn-may-1")
                .amount(new BigDecimal("100.00"))
                .type(TransactionType.EXPENSE)
                .category("Food")
                .date(LocalDate.of(2026, 5, 1))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Transaction txn2 = Transaction.builder()
                .id("txn-may-15")
                .amount(new BigDecimal("200.00"))
                .type(TransactionType.INCOME)
                .category("Salary")
                .date(LocalDate.of(2026, 5, 15))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Transaction txn3 = Transaction.builder()
                .id("txn-june-1")
                .amount(new BigDecimal("300.00"))
                .type(TransactionType.EXPENSE)
                .category("Rent")
                .date(LocalDate.of(2026, 6, 1))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        transactionRepository.save(txn1);
        transactionRepository.save(txn2);
        transactionRepository.save(txn3);

        long startScore = LocalDate.of(2026, 5, 1).toEpochDay();
        long endScore = LocalDate.of(2026, 5, 31).toEpochDay();

        List<String> mayIds = transactionRepository.findIdsByDateRange(startScore, endScore);

        assertEquals(2, mayIds.size());
        assertTrue(mayIds.contains("txn-may-1"));
        assertTrue(mayIds.contains("txn-may-15"));
        assertFalse(mayIds.contains("txn-june-1"));
    }

    @Test
    void testDeleteByIdRemovesAllIndexes() {
        String id = UUID.randomUUID().toString();
        Transaction txn = Transaction.builder()
                .id(id)
                .amount(new BigDecimal("75.00"))
                .type(TransactionType.EXPENSE)
                .category("Shopping")
                .date(LocalDate.of(2026, 5, 8))
                .note("New headphones")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        transactionRepository.save(txn);

        assertTrue(Boolean.TRUE.equals(stringRedisTemplate.hasKey(TransactionRepository.KEY_TXN_PREFIX + id)));
        assertNotNull(stringRedisTemplate.opsForZSet().score(TransactionRepository.KEY_BY_DATE, id));
        assertTrue(Boolean.TRUE.equals(stringRedisTemplate.opsForSet().isMember(TransactionRepository.KEY_CATEGORY_PREFIX + "Shopping", id)));
        assertTrue(Boolean.TRUE.equals(stringRedisTemplate.opsForSet().isMember(TransactionRepository.KEY_TYPE_PREFIX + "EXPENSE", id)));

        transactionRepository.deleteById(id);

        assertTrue(transactionRepository.findById(id).isEmpty());
        assertFalse(Boolean.TRUE.equals(stringRedisTemplate.hasKey(TransactionRepository.KEY_TXN_PREFIX + id)));
        assertNull(stringRedisTemplate.opsForZSet().score(TransactionRepository.KEY_BY_DATE, id));
        assertFalse(Boolean.TRUE.equals(stringRedisTemplate.opsForSet().isMember(TransactionRepository.KEY_CATEGORY_PREFIX + "Shopping", id)));
        assertFalse(Boolean.TRUE.equals(stringRedisTemplate.opsForSet().isMember(TransactionRepository.KEY_TYPE_PREFIX + "EXPENSE", id)));
    }
}
