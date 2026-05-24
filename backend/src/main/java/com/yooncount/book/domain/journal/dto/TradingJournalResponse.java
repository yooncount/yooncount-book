package com.yooncount.book.domain.journal.dto;

import com.yooncount.book.domain.investment.entity.TradeType;
import com.yooncount.book.domain.journal.entity.TradingJournal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TradingJournalResponse(
        Long id,
        String ticker,
        String stockName,
        TradeType tradeType,
        LocalDate tradeDate,
        int quantity,
        BigDecimal price,
        BigDecimal totalAmount,
        String reason,
        String strategy,
        String reflection,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TradingJournalResponse from(TradingJournal j) {
        return new TradingJournalResponse(
                j.getId(), j.getTicker(), j.getStockName(),
                j.getTradeType(), j.getTradeDate(),
                j.getQuantity(), j.getPrice(),
                j.getPrice().multiply(BigDecimal.valueOf(j.getQuantity())),
                j.getReason(), j.getStrategy(), j.getReflection(),
                j.getCreatedAt(), j.getUpdatedAt()
        );
    }
}
