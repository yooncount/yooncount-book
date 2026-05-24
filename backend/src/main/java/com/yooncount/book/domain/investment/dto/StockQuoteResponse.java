package com.yooncount.book.domain.investment.dto;

import java.math.BigDecimal;

public record StockQuoteResponse(
        String ticker,
        String stockName,
        BigDecimal currentPrice,
        BigDecimal change,
        BigDecimal changePercent,
        BigDecimal highPrice,
        BigDecimal lowPrice,
        BigDecimal openPrice,
        BigDecimal previousClose
) {}
