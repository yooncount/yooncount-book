package com.yooncount.book.domain.loan.repository;

import com.yooncount.book.domain.loan.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    Optional<Loan> findByIdAndOwnerId(Long id, Long ownerId);

    List<Loan> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    @Query("SELECT COALESCE(SUM(l.remainingBalance), 0) FROM Loan l " +
           "WHERE l.owner.id = :ownerId AND l.includeInAssets = true")
    BigDecimal sumRemainingBalanceIncludedInAssets(@Param("ownerId") Long ownerId);
}
