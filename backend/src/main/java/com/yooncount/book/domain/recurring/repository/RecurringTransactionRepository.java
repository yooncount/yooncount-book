package com.yooncount.book.domain.recurring.repository;

import com.yooncount.book.domain.recurring.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {

    Optional<RecurringTransaction> findByIdAndOwnerId(Long id, Long ownerId);

    @Query("SELECT r FROM RecurringTransaction r " +
           "JOIN FETCH r.category " +
           "LEFT JOIN FETCH r.paymentMethod " +
           "WHERE r.owner.id = :ownerId " +
           "ORDER BY r.isActive DESC, r.dayOfMonth ASC")
    List<RecurringTransaction> findAllWithDetails(@Param("ownerId") Long ownerId);
}
