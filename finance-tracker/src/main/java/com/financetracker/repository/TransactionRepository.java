package com.financetracker.repository;

import com.financetracker.model.Transaction;
import com.financetracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByDateDesc(User user);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.type = :type")
    List<Transaction> findByUserAndType(User user, Transaction.TransactionType type);

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type GROUP BY t.category")
    List<Object[]> sumAmountByCategoryAndType(User user, Transaction.TransactionType type);
}