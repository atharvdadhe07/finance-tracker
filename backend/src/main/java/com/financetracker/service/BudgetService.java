package com.financetracker.service;

import com.financetracker.dto.BudgetRequest;
import com.financetracker.dto.BudgetResponse;
import com.financetracker.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetResponse get() {
        return budgetRepository.get();
    }

    public BudgetResponse update(BudgetRequest req) {
        String currency = (req.getCurrency() != null && !req.getCurrency().isBlank())
                ? req.getCurrency().trim()
                : "USD";

        BudgetResponse budget = BudgetResponse.builder()
                .amount(req.getAmount())
                .currency(currency)
                .build();

        budgetRepository.save(budget);
        return budget;
    }
}
