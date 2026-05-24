package com.yooncount.book.domain.recurring.dto;

import com.yooncount.book.global.common.TransactionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecurringTransactionRequest(
        @NotBlank String name,
        @NotNull  TransactionType type,
        @NotNull  Long categoryId,
        Long paymentMethodId,
        @NotNull @Positive BigDecimal amount,
        String description,
        @Min(1) @Max(31) int dayOfMonth,
        @NotNull LocalDate startDate,
        LocalDate endDate
) {}
