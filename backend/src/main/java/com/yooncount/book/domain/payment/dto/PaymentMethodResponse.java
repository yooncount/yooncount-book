package com.yooncount.book.domain.payment.dto;

import com.yooncount.book.domain.payment.entity.PaymentMethod;
import com.yooncount.book.domain.payment.entity.PaymentMethodType;

import java.time.LocalDateTime;

public record PaymentMethodResponse(
        Long id,
        String name,
        PaymentMethodType type,
        LocalDateTime createdAt
) {
    public static PaymentMethodResponse from(PaymentMethod pm) {
        return new PaymentMethodResponse(pm.getId(), pm.getName(), pm.getType(), pm.getCreatedAt());
    }
}
