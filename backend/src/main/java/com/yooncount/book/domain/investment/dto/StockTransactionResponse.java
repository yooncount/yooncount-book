package com.yooncount.book.domain.investment.dto;

import com.yooncount.book.domain.investment.entity.StockTransaction;
import com.yooncount.book.domain.investment.entity.TradeType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record StockTransactionResponse(
        Long id,
        String ticker,
        String stockName,
        TradeType type,
        int quantity,
        BigDecimal price,
        BigDecimal fee,
        BigDecimal totalAmount,
        LocalDate tradedAt,
        String memo,
        LocalDateTime createdAt
) {
    public static StockTransactionResponse from(StockTransaction t) {
        BigDecimal total = t.getPrice().multiply(BigDecimal.valueOf(t.getQuantity()));
        BigDecimal totalAmount = t.getType() == TradeType.BUY
                ? total.add(t.getFee())
                : total.subtract(t.getFee());
        return new StockTransactionResponse(
                t.getId(), t.getTicker(), t.getStockName(),
                t.getType(), t.getQuantity(), t.getPrice(), t.getFee(),
                totalAmount, t.getTradedAt(), t.getMemo(), t.getCreatedAt()
        );
    }
}
