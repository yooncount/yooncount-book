package com.yooncount.book.domain.budget.dto;

import com.yooncount.book.domain.budget.entity.Budget;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record BudgetResponse(
        Long id,
        Long categoryId,
        String categoryName,
        int year,
        int month,
        BigDecimal budgetAmount,
        BigDecimal spentAmount,
        BigDecimal remainingAmount,
        double usageRatio
) {
    public static BudgetResponse of(Budget budget, BigDecimal spentAmount) {
        BigDecimal remaining = budget.getAmount().subtract(spentAmount);
        double ratio = budget.getAmount().compareTo(BigDecimal.ZERO) == 0 ? 0.0
                : spentAmount.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(1, RoundingMode.HALF_UP)
                        .doubleValue();
        return new BudgetResponse(
                budget.getId(),
                budget.getCategory().getId(),
                budget.getCategory().getName(),
                budget.getYear(),
                budget.getMonth(),
                budget.getAmount(),
                spentAmount,
                remaining,
                ratio
        );
    }
}
