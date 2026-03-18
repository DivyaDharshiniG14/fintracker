package com.financetracker.controller;

import com.financetracker.dto.TransactionDTO;
import com.financetracker.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionDTO.Response> addTransaction(
            Authentication auth,
            @RequestBody TransactionDTO.Request request) {
        return ResponseEntity.ok(transactionService.addTransaction(auth.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO.Response>> getAllTransactions(Authentication auth) {
        return ResponseEntity.ok(transactionService.getAllTransactions(auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(Authentication auth, @PathVariable Long id) {
        try {
            transactionService.deleteTransaction(auth.getName(), id);
            return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<TransactionDTO.Summary> getSummary(Authentication auth) {
        return ResponseEntity.ok(transactionService.getSummary(auth.getName()));
    }
}