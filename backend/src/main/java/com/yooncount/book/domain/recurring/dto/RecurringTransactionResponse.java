package com.yooncount.book.domain.recurring.dto;

import com.yooncount.book.domain.payment.entity.PaymentMethodType;
import com.yooncount.book.domain.recurring.entity.RecurringTransaction;
import com.yooncount.book.global.common.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record RecurringTransactionResponse(
        Long id,
        String name,
        TransactionType type,
        Long categoryId,
        String categoryName,
        Long paymentMethodId,
        String paymentMethodName,
        PaymentMethodType paymentMethodType,
        BigDecimal amount,
        String description,
        int dayOfMonth,
        LocalDate startDate,
        LocalDate endDate,
        boolean isActive,
        LocalDateTime createdAt
) {
    public static RecurringTransactionResponse from(RecurringTransaction r) {
        Long pmId     = r.getPaymentMethod() != null ? r.getPaymentMethod().getId() : null;
        String pmName = r.getPaymentMethod() != null ? r.getPaymentMethod().getName() : null;
        PaymentMethodType pmType = r.getPaymentMethod() != null ? r.getPaymentMethod().getType() : null;
        return new RecurringTransactionResponse(
                r.getId(), r.getName(), r.getType(),
                r.getCategory().getId(), r.getCategory().getName(),
                pmId, pmName, pmType,
                r.getAmount(), r.getDescription(), r.getDayOfMonth(),
                r.getStartDate(), r.getEndDate(), r.isActive(), r.getCreatedAt()
        );
    }
}
