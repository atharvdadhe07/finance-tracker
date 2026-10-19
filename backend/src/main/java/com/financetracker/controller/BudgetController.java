package com.financetracker.controller;

import com.financetracker.dto.BudgetRequest;
import com.financetracker.dto.BudgetResponse;
import com.financetracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<BudgetResponse> getBudget() {
        BudgetResponse budget = budgetService.get();
        return ResponseEntity.ok(budget);
    }

    @PutMapping
    public ResponseEntity<BudgetResponse> updateBudget(@Valid @RequestBody BudgetRequest req) {
        BudgetResponse updated = budgetService.update(req);
        return ResponseEntity.ok(updated);
    }
}
