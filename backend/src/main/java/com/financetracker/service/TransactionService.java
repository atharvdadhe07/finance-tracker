package com.financetracker.service;

import com.financetracker.dto.TransactionRequest;
import com.financetracker.dto.TransactionResponse;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.model.Transaction;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionResponse create(TransactionRequest req) {
        String id = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        Transaction txn = Transaction.builder()
                .id(id)
                .amount(req.getAmount())
                .type(req.getType())
                .category(req.getCategory())
                .date(req.getDate())
                .note(req.getNote())
                .createdAt(now)
                .updatedAt(now)
                .build();

        transactionRepository.save(txn);
        return toResponse(txn);
    }

    public List<TransactionResponse> getAll(String month, String type, String category, String q) {
        List<String> ids;
        if (month != null && !month.isBlank()) {
            YearMonth ym = YearMonth.parse(month.trim());
            long startScore = ym.atDay(1).toEpochDay();
            long endScore = ym.atEndOfMonth().toEpochDay();
            ids = transactionRepository.findIdsByDateRange(startScore, endScore);
        } else {
            ids = transactionRepository.findAllIdsSortedDesc();
        }

        List<Transaction> transactions = transactionRepository.findAllByIds(ids);

        return transactions.stream()
                .filter(t -> {
                    if (type != null && !type.isBlank()) {
                        if (t.getType() == null || !t.getType().name().equalsIgnoreCase(type.trim())) {
                            return false;
                        }
                    }
                    if (category != null && !category.isBlank()) {
                        if (t.getCategory() == null || !t.getCategory().equalsIgnoreCase(category.trim())) {
                            return false;
                        }
                    }
                    if (q != null && !q.isBlank()) {
                        if (t.getNote() == null || !t.getNote().toLowerCase().contains(q.trim().toLowerCase())) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted(Comparator.comparing(Transaction::getDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Transaction::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    public TransactionResponse getById(String id) {
        return transactionRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
    }

    public TransactionResponse update(String id, TransactionRequest req) {
        Transaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        Transaction updatedTxn = Transaction.builder()
                .id(existing.getId())
                .amount(req.getAmount())
                .type(req.getType())
                .category(req.getCategory())
                .date(req.getDate())
                .note(req.getNote())
                .createdAt(existing.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        transactionRepository.update(updatedTxn);
        return toResponse(updatedTxn);
    }

    public void delete(String id) {
        transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        transactionRepository.deleteById(id);
    }

    private TransactionResponse toResponse(Transaction txn) {
        if (txn == null) {
            return null;
        }
        return TransactionResponse.builder()
                .id(txn.getId())
                .amount(txn.getAmount())
                .type(txn.getType())
                .category(txn.getCategory())
                .date(txn.getDate())
                .note(txn.getNote())
                .createdAt(txn.getCreatedAt())
                .updatedAt(txn.getUpdatedAt())
                .build();
    }
}
