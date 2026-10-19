package com.financetracker.service;

import com.financetracker.dto.MonthlyDataResponse;
import com.financetracker.dto.SummaryResponse;
import com.financetracker.model.Transaction;
import com.financetracker.model.TransactionType;
import com.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private SummaryService summaryService;

    private final String testMonth = "2026-05";

    @Test
    void testEmptyMonthReturnsZeros() {
        when(transactionRepository.findIdsByDateRange(anyLong(), anyLong())).thenReturn(List.of());
        when(transactionRepository.findAllByIds(List.of())).thenReturn(List.of());

        SummaryResponse response = summaryService.getSummary(testMonth);

        assertNotNull(response);
        assertEquals(BigDecimal.ZERO, response.getTotalIncome());
        assertEquals(BigDecimal.ZERO, response.getTotalExpenses());
        assertEquals(BigDecimal.ZERO, response.getNetBalance());
        assertEquals(0, response.getTransactionCount());
        assertTrue(response.getExpenseByCategory().isEmpty());
    }

    @Test
    void testIncomeOnlyMonthReturnsCorrectTotals() {
        Transaction income1 = Transaction.builder()
                .id("1")
                .amount(new BigDecimal("3000.00"))
                .type(TransactionType.INCOME)
                .category("Salary")
                .date(LocalDate.of(2026, 5, 1))
                .createdAt(LocalDateTime.now())
                .build();

        Transaction income2 = Transaction.builder()
                .id("2")
                .amount(new BigDecimal("500.00"))
                .type(TransactionType.INCOME)
                .category("Bonus")
                .date(LocalDate.of(2026, 5, 15))
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionRepository.findIdsByDateRange(anyLong(), anyLong())).thenReturn(List.of("1", "2"));
        when(transactionRepository.findAllByIds(List.of("1", "2"))).thenReturn(List.of(income1, income2));

        SummaryResponse response = summaryService.getSummary(testMonth);

        assertNotNull(response);
        assertEquals(new BigDecimal("3500.00"), response.getTotalIncome());
        assertEquals(BigDecimal.ZERO, response.getTotalExpenses());
        assertEquals(new BigDecimal("3500.00"), response.getNetBalance());
        assertEquals(2, response.getTransactionCount());
        assertTrue(response.getExpenseByCategory().isEmpty());
    }

    @Test
    void testMixedMonthSumsCorrectlyAndGroupsExpensesByCategory() {
        Transaction income = Transaction.builder()
                .id("1")
                .amount(new BigDecimal("4000.00"))
                .type(TransactionType.INCOME)
                .category("Salary")
                .date(LocalDate.of(2026, 5, 1))
                .build();

        Transaction expense1 = Transaction.builder()
                .id("2")
                .amount(new BigDecimal("150.00"))
                .type(TransactionType.EXPENSE)
                .category("Food")
                .date(LocalDate.of(2026, 5, 5))
                .build();

        Transaction expense2 = Transaction.builder()
                .id("3")
                .amount(new BigDecimal("75.00"))
                .type(TransactionType.EXPENSE)
                .category("Food")
                .date(LocalDate.of(2026, 5, 10))
                .build();

        Transaction expense3 = Transaction.builder()
                .id("4")
                .amount(new BigDecimal("1000.00"))
                .type(TransactionType.EXPENSE)
                .category("Rent")
                .date(LocalDate.of(2026, 5, 2))
                .build();

        when(transactionRepository.findIdsByDateRange(anyLong(), anyLong())).thenReturn(List.of("1", "2", "3", "4"));
        when(transactionRepository.findAllByIds(List.of("1", "2", "3", "4")))
                .thenReturn(List.of(income, expense1, expense2, expense3));

        SummaryResponse response = summaryService.getSummary(testMonth);

        assertNotNull(response);
        assertEquals(new BigDecimal("4000.00"), response.getTotalIncome());
        assertEquals(new BigDecimal("1225.00"), response.getTotalExpenses());
        assertEquals(new BigDecimal("2775.00"), response.getNetBalance());
        assertEquals(4, response.getTransactionCount());
        assertEquals(new BigDecimal("225.00"), response.getExpenseByCategory().get("Food"));
        assertEquals(new BigDecimal("1000.00"), response.getExpenseByCategory().get("Rent"));
    }

    @Test
    void testGetMonthlyHistoryReturnsCorrectNumberOfEntries() {
        when(transactionRepository.findIdsByDateRange(anyLong(), anyLong())).thenReturn(List.of());
        when(transactionRepository.findAllByIds(anyList())).thenReturn(List.of());

        List<MonthlyDataResponse> history = summaryService.getMonthlyHistory(6);

        assertNotNull(history);
        assertEquals(6, history.size());
    }
}
