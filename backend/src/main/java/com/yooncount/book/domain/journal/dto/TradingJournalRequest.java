package com.yooncount.book.domain.journal.dto;

import com.yooncount.book.domain.investment.entity.TradeType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TradingJournalRequest(
        @NotBlank String ticker,
        @NotBlank String stockName,
        @NotNull  TradeType tradeType,
        @NotNull  LocalDate tradeDate,
        @Min(1)   int quantity,
        @NotNull  BigDecimal price,
        @NotBlank String reason,
        String strategy,
        String reflection
) {}
