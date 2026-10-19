package com.financetracker.service;

import com.financetracker.model.Transaction;
import com.financetracker.model.TransactionType;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeedService {

    private final TransactionRepository transactionRepository;

    private record SeedItem(
            BigDecimal amount,
            TransactionType type,
            String category,
            int minusDays,
            String note
    ) {}

    private static final List<SeedItem> SEED_DATA = List.of(
            new SeedItem(new BigDecimal("4200.00"), TransactionType.INCOME, "Salary", 75, "Monthly Salary"),
            new SeedItem(new BigDecimal("4200.00"), TransactionType.INCOME, "Salary", 45, "Monthly Salary"),
            new SeedItem(new BigDecimal("4500.00"), TransactionType.INCOME, "Salary", 15, "Monthly Salary & Bonus"),
            new SeedItem(new BigDecimal("1100.00"), TransactionType.EXPENSE, "Rent", 74, "Apartment Rent"),
            new SeedItem(new BigDecimal("1100.00"), TransactionType.EXPENSE, "Rent", 44, "Apartment Rent"),
            new SeedItem(new BigDecimal("1100.00"), TransactionType.EXPENSE, "Rent", 14, "Apartment Rent"),
            new SeedItem(new BigDecimal("85.50"), TransactionType.EXPENSE, "Bills", 70, "Electricity bill"),
            new SeedItem(new BigDecimal("60.00"), TransactionType.EXPENSE, "Bills", 55, "High-speed Internet"),
            new SeedItem(new BigDecimal("92.20"), TransactionType.EXPENSE, "Bills", 20, "Water & Gas utility"),
            new SeedItem(new BigDecimal("45.00"), TransactionType.EXPENSE, "Bills", 10, "Mobile phone plan"),
            new SeedItem(new BigDecimal("125.40"), TransactionType.EXPENSE, "Food", 68, "Weekly grocery run at Whole Foods"),
            new SeedItem(new BigDecimal("42.50"), TransactionType.EXPENSE, "Food", 60, "Dinner at Italian bistro"),
            new SeedItem(new BigDecimal("110.80"), TransactionType.EXPENSE, "Food", 38, "Supermarket pantry restock"),
            new SeedItem(new BigDecimal("28.00"), TransactionType.EXPENSE, "Food", 25, "Lunch with colleagues"),
            new SeedItem(new BigDecimal("95.30"), TransactionType.EXPENSE, "Food", 7, "Farmers market produce & bakery"),
            new SeedItem(new BigDecimal("50.00"), TransactionType.EXPENSE, "Transport", 62, "Gas station fuel"),
            new SeedItem(new BigDecimal("75.00"), TransactionType.EXPENSE, "Transport", 35, "Monthly metro pass"),
            new SeedItem(new BigDecimal("32.50"), TransactionType.EXPENSE, "Transport", 12, "Uber ride from airport"),
            new SeedItem(new BigDecimal("145.00"), TransactionType.EXPENSE, "Shopping", 50, "Winter jacket"),
            new SeedItem(new BigDecimal("65.00"), TransactionType.EXPENSE, "Shopping", 18, "Running shoes & sports gear"),
            new SeedItem(new BigDecimal("18.99"), TransactionType.EXPENSE, "Entertainment", 40, "Netflix & Spotify subscriptions"),
            new SeedItem(new BigDecimal("45.00"), TransactionType.EXPENSE, "Entertainment", 22, "Movie tickets and snacks"),
            new SeedItem(new BigDecimal("120.00"), TransactionType.EXPENSE, "Health", 48, "Dental cleaning and checkup"),
            new SeedItem(new BigDecimal("35.50"), TransactionType.EXPENSE, "Health", 16, "Vitamins and prescription"),
            new SeedItem(new BigDecimal("85.00"), TransactionType.EXPENSE, "Other", 5, "Home office chair cushion & lamp")
    );

    public int seed() {
        if (transactionRepository.count() > 5) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        for (SeedItem item : SEED_DATA) {
            Transaction txn = Transaction.builder()
                    .id(UUID.randomUUID().toString())
                    .amount(item.amount())
                    .type(item.type())
                    .category(item.category())
                    .date(today.minusDays(item.minusDays()))
                    .note(item.note())
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            transactionRepository.save(txn);
        }

        return SEED_DATA.size();
    }
}
