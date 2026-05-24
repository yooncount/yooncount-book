package com.yooncount.book.domain.transaction.repository;

import com.yooncount.book.domain.transaction.entity.Transaction;
import com.yooncount.book.global.common.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t JOIN FETCH t.category c " +
           "LEFT JOIN FETCH t.paymentMethod " +
           "WHERE t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:categoryId IS NULL OR c.id = :categoryId) " +
           "ORDER BY t.transactionDate DESC, t.createdAt DESC")
    List<Transaction> findByFilter(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") TransactionType type,
            @Param("categoryId") Long categoryId
    );

    @Query("SELECT t.type, t.category.id, t.category.name, SUM(t.amount) " +
           "FROM Transaction t " +
           "WHERE t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.type, t.category.id, t.category.name " +
           "ORDER BY t.type, SUM(t.amount) DESC")
    List<Object[]> sumGroupedByCategoryAndType(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT t.category.id, SUM(t.amount) " +
           "FROM Transaction t " +
           "WHERE t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.type = :type " +
           "GROUP BY t.category.id")
    List<Object[]> sumAmountByCategoryAndType(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") TransactionType type
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type")
    java.math.BigDecimal sumTotalByType(@Param("type") TransactionType type);

    @Query("SELECT EXTRACT(MONTH FROM t.transactionDate), t.type, SUM(t.amount) " +
           "FROM Transaction t " +
           "WHERE EXTRACT(YEAR FROM t.transactionDate) = :year " +
           "GROUP BY EXTRACT(MONTH FROM t.transactionDate), t.type " +
           "ORDER BY EXTRACT(MONTH FROM t.transactionDate)")
    List<Object[]> sumByMonthAndType(@Param("year") int year);

    @Query("SELECT EXTRACT(YEAR FROM t.transactionDate), " +
           "EXTRACT(MONTH FROM t.transactionDate), SUM(t.amount) " +
           "FROM Transaction t " +
           "WHERE t.category.id = :categoryId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY EXTRACT(YEAR FROM t.transactionDate), " +
           "EXTRACT(MONTH FROM t.transactionDate) " +
           "ORDER BY EXTRACT(YEAR FROM t.transactionDate), " +
           "EXTRACT(MONTH FROM t.transactionDate)")
    List<Object[]> sumByYearMonthForCategory(
            @Param("categoryId") Long categoryId,
            @Param("startDate")  LocalDate startDate,
            @Param("endDate")    LocalDate endDate
    );

    @Query("SELECT t.paymentMethod.id, t.paymentMethod.name, t.paymentMethod.type, " +
           "t.category.id, t.category.name, SUM(t.amount) " +
           "FROM Transaction t " +
           "WHERE t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.paymentMethod IS NOT NULL " +
           "GROUP BY t.paymentMethod.id, t.paymentMethod.name, t.paymentMethod.type, " +
           "t.category.id, t.category.name " +
           "ORDER BY t.paymentMethod.id, SUM(t.amount) DESC")
    List<Object[]> sumByPaymentMethodAndCategory(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
