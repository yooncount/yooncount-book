package com.yooncount.book.domain.transaction.dto;

import com.yooncount.book.domain.payment.entity.PaymentMethodType;
import com.yooncount.book.domain.transaction.entity.Transaction;
import com.yooncount.book.global.common.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        BigDecimal amount,
        TransactionType type,
        Long categoryId,
        String categoryName,
        Long paymentMethodId,
        String paymentMethodName,
        PaymentMethodType paymentMethodType,
        String description,
        LocalDate transactionDate,
        LocalDateTime createdAt
) {
    public static TransactionResponse from(Transaction t) {
        Long pmId = t.getPaymentMethod() != null ? t.getPaymentMethod().getId() : null;
        String pmName = t.getPaymentMethod() != null ? t.getPaymentMethod().getName() : null;
        PaymentMethodType pmType = t.getPaymentMethod() != null ? t.getPaymentMethod().getType() : null;
        return new TransactionResponse(
                t.getId(), t.getAmount(), t.getType(),
                t.getCategory().getId(), t.getCategory().getName(),
                pmId, pmName, pmType,
                t.getDescription(), t.getTransactionDate(), t.getCreatedAt()
        );
    }
}
