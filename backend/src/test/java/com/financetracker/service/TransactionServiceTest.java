package com.financetracker.service;

import com.financetracker.dto.TransactionRequest;
import com.financetracker.dto.TransactionResponse;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.model.Transaction;
import com.financetracker.model.TransactionType;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void testCreateSetsIdCreatedAtUpdatedAt() {
        TransactionRequest req = TransactionRequest.builder()
                .amount(new BigDecimal("120.50"))
                .type(TransactionType.EXPENSE)
                .category("Food")
                .date(LocalDate.of(2026, 5, 10))
                .note("Weekly groceries")
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionResponse response = transactionService.create(req);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertNotNull(response.getCreatedAt());
        assertNotNull(response.getUpdatedAt());
        assertEquals(req.getAmount(), response.getAmount());
        assertEquals(req.getType(), response.getType());
        assertEquals(req.getCategory(), response.getCategory());
        assertEquals(req.getDate(), response.getDate());
        assertEquals(req.getNote(), response.getNote());

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        Transaction captured = captor.getValue();
        assertEquals(response.getId(), captured.getId());
        assertEquals(response.getCreatedAt(), captured.getCreatedAt());
        assertEquals(response.getUpdatedAt(), captured.getUpdatedAt());
    }

    @Test
    void testGetAllWithTypeFilterOnlyReturnsMatchingType() {
        Transaction incomeTxn = Transaction.builder()
                .id("1")
                .amount(new BigDecimal("3000.00"))
                .type(TransactionType.INCOME)
                .category("Salary")
                .date(LocalDate.of(2026, 5, 1))
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        Transaction expenseTxn = Transaction.builder()
                .id("2")
                .amount(new BigDecimal("50.00"))
                .type(TransactionType.EXPENSE)
                .category("Food")
                .date(LocalDate.of(2026, 5, 2))
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();

        when(transactionRepository.findAllIdsSortedDesc()).thenReturn(List.of("1", "2"));
        when(transactionRepository.findAllByIds(List.of("1", "2"))).thenReturn(List.of(incomeTxn, expenseTxn));

        List<TransactionResponse> result = transactionService.getAll(null, "INCOME", null, null);

        assertEquals(1, result.size());
        assertEquals(TransactionType.INCOME, result.get(0).getType());
        assertEquals("1", result.get(0).getId());
    }

    @Test
    void testGetAllWithQFilterMatchesNoteCaseInsensitively() {
        Transaction txn1 = Transaction.builder()
                .id("1")
                .amount(new BigDecimal("100.00"))
                .type(TransactionType.EXPENSE)
                .category("Food")
                .date(LocalDate.of(2026, 5, 1))
                .note("Grocery shopping at supermarket")
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        Transaction txn2 = Transaction.builder()
                .id("2")
                .amount(new BigDecimal("60.00"))
                .type(TransactionType.EXPENSE)
                .category("Bills")
                .date(LocalDate.of(2026, 5, 2))
                .note("Electricity bill")
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();

        when(transactionRepository.findAllIdsSortedDesc()).thenReturn(List.of("1", "2"));
        when(transactionRepository.findAllByIds(List.of("1", "2"))).thenReturn(List.of(txn1, txn2));

        List<TransactionResponse> result = transactionService.getAll(null, null, null, "GROCERY");

        assertEquals(1, result.size());
        assertEquals("1", result.get(0).getId());
        assertTrue(result.get(0).getNote().toLowerCase().contains("grocery"));
    }

    @Test
    void testDeleteOnUnknownIdThrowsResourceNotFoundException() {
        when(transactionRepository.findById("unknown-id")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> transactionService.delete("unknown-id"));
        verify(transactionRepository, never()).deleteById(anyString());
    }
}
