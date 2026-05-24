package com.yooncount.book.domain.savings.dto;

import com.yooncount.book.domain.savings.entity.SavingsGoal;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SavingsGoalResponse(
        Long id,
        String name,
        BigDecimal targetAmount,
        BigDecimal savedAmount,
        BigDecimal remainingAmount,
        double progressRate,
        LocalDate targetDate,
        String memo,
        boolean isCompleted,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static SavingsGoalResponse from(SavingsGoal g) {
        BigDecimal remaining = g.getTargetAmount().subtract(g.getSavedAmount());
        double rate = g.getTargetAmount().compareTo(BigDecimal.ZERO) == 0 ? 0.0 :
                g.getSavedAmount()
                 .divide(g.getTargetAmount(), 4, RoundingMode.HALF_UP)
                 .multiply(BigDecimal.valueOf(100))
                 .setScale(1, RoundingMode.HALF_UP)
                 .doubleValue();
        return new SavingsGoalResponse(
                g.getId(), g.getName(),
                g.getTargetAmount(), g.getSavedAmount(),
                remaining.max(BigDecimal.ZERO), rate,
                g.getTargetDate(), g.getMemo(),
                g.isCompleted(), g.getCreatedAt(), g.getUpdatedAt()
        );
    }
}
