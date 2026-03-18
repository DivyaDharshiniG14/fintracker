package com.financetracker.dto;

import com.financetracker.model.Transaction;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class TransactionDTO {

    @Data
    public static class Request {
        private String description;
        private BigDecimal amount;
        private Transaction.TransactionType type;
        private Transaction.Category category;
        private LocalDateTime date;
    }

    @Data
    public static class Response {
        private Long id;
        private String description;
        private BigDecimal amount;
        private Transaction.TransactionType type;
        private Transaction.Category category;
        private LocalDateTime date;

        public static Response fromTransaction(Transaction t) {
            Response r = new Response();
            r.setId(t.getId());
            r.setDescription(t.getDescription());
            r.setAmount(t.getAmount());
            r.setType(t.getType());
            r.setCategory(t.getCategory());
            r.setDate(t.getDate());
            return r;
        }
    }

    @Data
    public static class Summary {
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private BigDecimal balance;
        private Map<String, BigDecimal> expenseByCategory;
        private Map<String, BigDecimal> incomeByCategory;
    }
}