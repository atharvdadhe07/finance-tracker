package com.financetracker.repository;

import com.financetracker.model.Transaction;
import com.financetracker.model.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Repository
@RequiredArgsConstructor
public class TransactionRepository {

    public static final String KEY_TXN_PREFIX = "txn:";
    public static final String KEY_BY_DATE = "txn:by-date";
    public static final String KEY_CATEGORY_PREFIX = "txn:category:";
    public static final String KEY_TYPE_PREFIX = "txn:type:";

    private final StringRedisTemplate stringRedisTemplate;

    public Transaction save(Transaction txn) {
        String id = txn.getId();
        Map<String, String> hash = new HashMap<>();
        hash.put("id", id);
        hash.put("amount", txn.getAmount() != null ? txn.getAmount().toPlainString() : "0");
        hash.put("type", txn.getType() != null ? txn.getType().name() : "");
        hash.put("category", txn.getCategory() != null ? txn.getCategory() : "");
        hash.put("date", txn.getDate() != null ? txn.getDate().toString() : "");
        hash.put("note", txn.getNote() != null ? txn.getNote() : "");
        hash.put("createdAt", txn.getCreatedAt() != null ? txn.getCreatedAt().toString() : "");
        hash.put("updatedAt", txn.getUpdatedAt() != null ? txn.getUpdatedAt().toString() : "");

        stringRedisTemplate.opsForHash().putAll(KEY_TXN_PREFIX + id, hash);

        if (txn.getDate() != null) {
            stringRedisTemplate.opsForZSet().add(KEY_BY_DATE, id, (double) txn.getDate().toEpochDay());
        }
        if (txn.getCategory() != null && !txn.getCategory().isBlank()) {
            stringRedisTemplate.opsForSet().add(KEY_CATEGORY_PREFIX + txn.getCategory(), id);
        }
        if (txn.getType() != null) {
            stringRedisTemplate.opsForSet().add(KEY_TYPE_PREFIX + txn.getType().name(), id);
        }

        return txn;
    }

    public Optional<Transaction> findById(String id) {
        Map<Object, Object> entries = stringRedisTemplate.opsForHash().entries(KEY_TXN_PREFIX + id);
        if (entries == null || entries.isEmpty()) {
            return Optional.empty();
        }
        return Optional.ofNullable(mapToTransaction(entries));
    }

    public List<String> findIdsByDateRange(long startScore, long endScore) {
        Set<String> ids = stringRedisTemplate.opsForZSet().rangeByScore(KEY_BY_DATE, (double) startScore, (double) endScore);
        return ids != null ? new ArrayList<>(ids) : Collections.emptyList();
    }

    public List<String> findAllIdsSortedDesc() {
        Set<String> ids = stringRedisTemplate.opsForZSet().reverseRangeByScore(KEY_BY_DATE, Double.NEGATIVE_INFINITY, Double.POSITIVE_INFINITY);
        return ids != null ? new ArrayList<>(ids) : Collections.emptyList();
    }

    public void deleteById(String id) {
        Optional<Transaction> existing = findById(id);
        if (existing.isPresent()) {
            Transaction txn = existing.get();
            stringRedisTemplate.delete(KEY_TXN_PREFIX + id);
            stringRedisTemplate.opsForZSet().remove(KEY_BY_DATE, id);
            if (txn.getCategory() != null && !txn.getCategory().isBlank()) {
                stringRedisTemplate.opsForSet().remove(KEY_CATEGORY_PREFIX + txn.getCategory(), id);
            }
            if (txn.getType() != null) {
                stringRedisTemplate.opsForSet().remove(KEY_TYPE_PREFIX + txn.getType().name(), id);
            }
        }
    }

    public Transaction update(Transaction txn) {
        Optional<Transaction> existing = findById(txn.getId());
        if (existing.isPresent()) {
            Transaction oldTxn = existing.get();
            stringRedisTemplate.opsForZSet().remove(KEY_BY_DATE, oldTxn.getId());
            if (oldTxn.getCategory() != null && !oldTxn.getCategory().isBlank()) {
                stringRedisTemplate.opsForSet().remove(KEY_CATEGORY_PREFIX + oldTxn.getCategory(), oldTxn.getId());
            }
            if (oldTxn.getType() != null) {
                stringRedisTemplate.opsForSet().remove(KEY_TYPE_PREFIX + oldTxn.getType().name(), oldTxn.getId());
            }
        }
        return save(txn);
    }

    public List<Transaction> findAllByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }

        List<Object> rawResults = stringRedisTemplate.executePipelined(new SessionCallback<Object>() {
            @Override
            @SuppressWarnings("unchecked")
            public <K, V> Object execute(RedisOperations<K, V> operations) throws DataAccessException {
                for (String id : ids) {
                    operations.opsForHash().entries((K) (KEY_TXN_PREFIX + id));
                }
                return null;
            }
        });

        List<Transaction> transactions = new ArrayList<>();
        for (Object res : rawResults) {
            if (res instanceof Map<?, ?> map && !map.isEmpty()) {
                transactions.add(mapToTransaction((Map<Object, Object>) map));
            }
        }
        return transactions;
    }

    public long count() {
        Long count = stringRedisTemplate.opsForZSet().zCard(KEY_BY_DATE);
        return count != null ? count : 0L;
    }

    public Transaction mapToTransaction(Map<Object, Object> hash) {
        if (hash == null || hash.isEmpty()) {
            return null;
        }

        String id = Objects.toString(hash.get("id"), null);
        String amountStr = Objects.toString(hash.get("amount"), null);
        BigDecimal amount = (amountStr != null && !amountStr.isBlank()) ? new BigDecimal(amountStr) : BigDecimal.ZERO;
        String typeStr = Objects.toString(hash.get("type"), null);
        TransactionType type = (typeStr != null && !typeStr.isBlank()) ? TransactionType.valueOf(typeStr) : null;
        String category = Objects.toString(hash.get("category"), null);
        String dateStr = Objects.toString(hash.get("date"), null);
        LocalDate date = (dateStr != null && !dateStr.isBlank()) ? LocalDate.parse(dateStr) : null;
        String note = Objects.toString(hash.get("note"), null);
        String createdAtStr = Objects.toString(hash.get("createdAt"), null);
        LocalDateTime createdAt = (createdAtStr != null && !createdAtStr.isBlank()) ? LocalDateTime.parse(createdAtStr) : null;
        String updatedAtStr = Objects.toString(hash.get("updatedAt"), null);
        LocalDateTime updatedAt = (updatedAtStr != null && !updatedAtStr.isBlank()) ? LocalDateTime.parse(updatedAtStr) : null;

        return Transaction.builder()
                .id(id)
                .amount(amount)
                .type(type)
                .category(category)
                .date(date)
                .note(note)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }
}
