package com.financetracker.controller;

import com.financetracker.dto.TransactionResponse;
import com.financetracker.service.TransactionService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final TransactionService transactionService;

    @GetMapping("/csv")
    public void exportCsv(
            @RequestParam(required = false) String month,
            HttpServletResponse response
    ) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=transactions.csv");

        List<TransactionResponse> transactions = transactionService.getAll(month, null, null, null);
        PrintWriter writer = response.getWriter();
        writer.println("id,amount,type,category,date,note");

        for (TransactionResponse txn : transactions) {
            String id = txn.getId() != null ? txn.getId() : "";
            String amount = txn.getAmount() != null ? txn.getAmount().toPlainString() : "";
            String type = txn.getType() != null ? txn.getType().name() : "";
            String category = txn.getCategory() != null ? txn.getCategory() : "";
            String date = txn.getDate() != null ? txn.getDate().toString() : "";
            String note = txn.getNote() != null ? txn.getNote() : "";

            if (note.contains(",") || note.contains("\"") || note.contains("\n") || note.contains("\r")) {
                note = "\"" + note.replace("\"", "\"\"") + "\"";
            }

            writer.println(String.join(",", id, amount, type, category, date, note));
        }

        writer.flush();
    }
}
