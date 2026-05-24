package com.yooncount.book.domain.loan.repository;

import com.yooncount.book.domain.loan.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(l.remainingBalance), 0) FROM Loan l WHERE l.includeInAssets = true")
    BigDecimal sumRemainingBalanceIncludedInAssets();
}
