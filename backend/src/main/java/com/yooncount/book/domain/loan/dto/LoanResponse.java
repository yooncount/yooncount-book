package com.yooncount.book.domain.loan.dto;

import com.yooncount.book.domain.loan.entity.Loan;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LoanResponse(
        Long id,
        String name,
        String lender,
        BigDecimal principal,
        BigDecimal remainingBalance,
        BigDecimal interestRate,
        LocalDate startDate,
        LocalDate endDate,
        boolean includeInAssets,
        String memo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static LoanResponse from(Loan loan) {
        return new LoanResponse(
                loan.getId(), loan.getName(), loan.getLender(),
                loan.getPrincipal(), loan.getRemainingBalance(), loan.getInterestRate(),
                loan.getStartDate(), loan.getEndDate(), loan.isIncludeInAssets(),
                loan.getMemo(), loan.getCreatedAt(), loan.getUpdatedAt()
        );
    }
}
