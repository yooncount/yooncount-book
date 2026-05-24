package com.yooncount.book.domain.savings.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DepositRequest(
        @NotNull @DecimalMin("1") BigDecimal amount
) {}
