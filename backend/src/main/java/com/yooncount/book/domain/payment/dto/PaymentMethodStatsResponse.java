package com.yooncount.book.domain.payment.dto;

import com.yooncount.book.domain.payment.entity.PaymentMethodType;

import java.math.BigDecimal;
import java.util.List;

public record PaymentMethodStatsResponse(
        Long paymentMethodId,
        String paymentMethodName,
        PaymentMethodType paymentMethodType,
        BigDecimal totalAmount,
        List<CategoryBreakdown> categories
) {
    public record CategoryBreakdown(
            Long categoryId,
            String categoryName,
            BigDecimal amount
    ) {}
}
