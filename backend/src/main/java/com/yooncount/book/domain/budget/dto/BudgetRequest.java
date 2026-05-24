package com.yooncount.book.domain.budget.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BudgetRequest(
        @NotNull(message = "카테고리를 선택해주세요.")
        Long categoryId,

        @NotNull(message = "연도를 입력해주세요.")
        @Min(value = 2000, message = "연도는 2000 이상이어야 합니다.")
        @Max(value = 9999, message = "올바른 연도를 입력해주세요.")
        Integer year,

        @NotNull(message = "월을 입력해주세요.")
        @Min(value = 1, message = "월은 1 이상이어야 합니다.")
        @Max(value = 12, message = "월은 12 이하여야 합니다.")
        Integer month,

        @NotNull(message = "예산 금액을 입력해주세요.")
        @Positive(message = "예산 금액은 0보다 커야 합니다.")
        BigDecimal amount
) {}
