package com.yooncount.book.domain.savings.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingsGoalRequest(
        @NotBlank String name,
        @NotNull @DecimalMin("1") BigDecimal targetAmount,
        BigDecimal savedAmount,
        @NotNull LocalDate targetDate,
        String memo
) {}
