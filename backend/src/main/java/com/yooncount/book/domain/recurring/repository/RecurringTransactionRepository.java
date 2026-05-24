package com.yooncount.book.domain.recurring.repository;

import com.yooncount.book.domain.recurring.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {

    @Query("SELECT r FROM RecurringTransaction r " +
           "JOIN FETCH r.category " +
           "LEFT JOIN FETCH r.paymentMethod " +
           "ORDER BY r.isActive DESC, r.dayOfMonth ASC")
    List<RecurringTransaction> findAllWithDetails();
}
