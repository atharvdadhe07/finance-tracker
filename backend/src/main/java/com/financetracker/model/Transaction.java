package com.financetracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    private String id;
    private BigDecimal amount;
    private TransactionType type;
    private String category;
    private LocalDate date;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
