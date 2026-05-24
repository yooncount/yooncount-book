package com.yooncount.book.domain.payment.dto;

import com.yooncount.book.domain.payment.entity.PaymentMethodType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentMethodRequest(
        @NotBlank String name,
        @NotNull  PaymentMethodType type
) {}
