package com.financetracker.service;

import com.financetracker.dto.MonthlyDataResponse;
import com.financetracker.dto.SummaryResponse;
import com.financetracker.model.Transaction;
import com.financetracker.model.TransactionType;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final TransactionRepository transactionRepository;

    public SummaryResponse getSummary(String month) {
        String targetMonth = (month != null && !month.isBlank()) ? month.trim() : YearMonth.now().toString();
        YearMonth ym = YearMonth.parse(targetMonth);

        long startScore = ym.atDay(1).toEpochDay();
        long endScore = ym.atEndOfMonth().toEpochDay();

        List<String> ids = transactionRepository.findIdsByDateRange(startScore, endScore);
        List<Transaction> transactions = transactionRepository.findAllByIds(ids);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();

        for (Transaction txn : transactions) {
            if (txn.getAmount() == null) {
                continue;
            }

            if (txn.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(txn.getAmount());
            } else if (txn.getType() == TransactionType.EXPENSE) {
                totalExpenses = totalExpenses.add(txn.getAmount());
                String category = (txn.getCategory() != null && !txn.getCategory().isBlank())
                        ? txn.getCategory()
                        : "Other";
                expenseByCategory.merge(category, txn.getAmount(), BigDecimal::add);
            }
        }

        BigDecimal netBalance = totalIncome.subtract(totalExpenses);
        int transactionCount = transactions.size();

        return SummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netBalance(netBalance)
                .transactionCount(transactionCount)
                .expenseByCategory(expenseByCategory)
                .build();
    }

    public List<MonthlyDataResponse> getMonthlyHistory(int months) {
        int count = months > 0 ? months : 6;
        YearMonth currentMonth = YearMonth.now();
        List<MonthlyDataResponse> history = new ArrayList<>(count);

        for (int i = count - 1; i >= 0; i--) {
            YearMonth ym = currentMonth.minusMonths(i);
            SummaryResponse summary = getSummary(ym.toString());

            history.add(MonthlyDataResponse.builder()
                    .month(ym.toString())
                    .income(summary.getTotalIncome())
                    .expense(summary.getTotalExpenses())
                    .build());
        }

        return history;
    }
}
