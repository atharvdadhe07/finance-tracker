package com.financetracker.controller;

import com.financetracker.dto.MonthlyDataResponse;
import com.financetracker.dto.SummaryResponse;
import com.financetracker.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping
    public ResponseEntity<SummaryResponse> getSummary(@RequestParam(required = false) String month) {
        SummaryResponse summary = summaryService.getSummary(month);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyDataResponse>> getMonthlyHistory(
            @RequestParam(defaultValue = "6") int months
    ) {
        List<MonthlyDataResponse> history = summaryService.getMonthlyHistory(months);
        return ResponseEntity.ok(history);
    }
}
