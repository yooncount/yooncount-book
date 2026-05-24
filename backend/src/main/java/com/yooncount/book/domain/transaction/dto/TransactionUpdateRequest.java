package com.yooncount.book.domain.transaction.dto;

import com.yooncount.book.global.common.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionUpdateRequest(
        @NotNull(message = "금액을 입력해주세요.")
        @Positive(message = "금액은 0보다 커야 합니다.")
        BigDecimal amount,

        @NotNull(message = "거래 타입을 선택해주세요.")
        TransactionType type,

        @NotNull(message = "카테고리를 선택해주세요.")
        Long categoryId,

        Long paymentMethodId,

        @Size(max = 255, message = "메모는 255자 이하여야 합니다.")
        String description,

        @NotNull(message = "거래 날짜를 입력해주세요.")
        LocalDate transactionDate
) {}
