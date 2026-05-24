package com.yooncount.book.domain.investment.dto;

import com.yooncount.book.domain.investment.entity.TradeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StockTransactionRequest(
        @NotBlank(message = "종목 코드를 입력해주세요.")
        @Size(max = 20)
        String ticker,

        @NotBlank(message = "종목명을 입력해주세요.")
        @Size(max = 100)
        String stockName,

        @NotNull(message = "거래 유형을 선택해주세요. (BUY/SELL)")
        TradeType type,

        @NotNull(message = "수량을 입력해주세요.")
        @Positive(message = "수량은 0보다 커야 합니다.")
        Integer quantity,

        @NotNull(message = "단가를 입력해주세요.")
        @Positive(message = "단가는 0보다 커야 합니다.")
        BigDecimal price,

        BigDecimal fee,

        @NotNull(message = "거래일을 입력해주세요.")
        LocalDate tradedAt,

        @Size(max = 255)
        String memo
) {
    public BigDecimal feeOrZero() {
        return fee != null ? fee : BigDecimal.ZERO;
    }
}
