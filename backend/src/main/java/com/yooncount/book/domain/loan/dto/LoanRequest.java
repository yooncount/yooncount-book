package com.yooncount.book.domain.loan.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LoanRequest(
        @NotBlank String name,
        String lender,
        @NotNull @DecimalMin("0") BigDecimal principal,
        @NotNull @DecimalMin("0") BigDecimal remainingBalance,
        BigDecimal interestRate,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        boolean includeInAssets,
        String memo
) {}
