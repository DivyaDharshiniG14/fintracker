package com.financetracker.service;

import com.financetracker.dto.TransactionDTO;
import com.financetracker.model.Transaction;
import com.financetracker.model.User;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public TransactionDTO.Response addTransaction(String username, TransactionDTO.Request request) {
        User user = getUser(username);
        Transaction transaction = new Transaction();
        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(request.getCategory());
        transaction.setDate(request.getDate() != null ? request.getDate() : LocalDateTime.now());
        transaction.setUser(user);
        return TransactionDTO.Response.fromTransaction(transactionRepository.save(transaction));
    }

    public List<TransactionDTO.Response> getAllTransactions(String username) {
        User user = getUser(username);
        return transactionRepository.findByUserOrderByDateDesc(user)
                .stream()
                .map(TransactionDTO.Response::fromTransaction)
                .collect(Collectors.toList());
    }

    public void deleteTransaction(String username, Long id) {
        User user = getUser(username);
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        transactionRepository.delete(transaction);
    }

    public TransactionDTO.Summary getSummary(String username) {
        User user = getUser(username);

        List<Transaction> incomes = transactionRepository.findByUserAndType(user, Transaction.TransactionType.INCOME);
        List<Transaction> expenses = transactionRepository.findByUserAndType(user, Transaction.TransactionType.EXPENSE);

        BigDecimal totalIncome = incomes.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = expenses.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        List<Object[]> expenseData = transactionRepository.sumAmountByCategoryAndType(user, Transaction.TransactionType.EXPENSE);
        for (Object[] row : expenseData) {
            expenseByCategory.put(row[0].toString(), (BigDecimal) row[1]);
        }

        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        List<Object[]> incomeData = transactionRepository.sumAmountByCategoryAndType(user, Transaction.TransactionType.INCOME);
        for (Object[] row : incomeData) {
            incomeByCategory.put(row[0].toString(), (BigDecimal) row[1]);
        }

        TransactionDTO.Summary summary = new TransactionDTO.Summary();
        summary.setTotalIncome(totalIncome);
        summary.setTotalExpense(totalExpense);
        summary.setBalance(totalIncome.subtract(totalExpense));
        summary.setExpenseByCategory(expenseByCategory);
        summary.setIncomeByCategory(incomeByCategory);

        return summary;
    }
}