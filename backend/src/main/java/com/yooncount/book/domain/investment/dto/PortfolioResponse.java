package com.yooncount.book.domain.investment.dto;

import java.math.BigDecimal;

public record PortfolioResponse(
        String ticker,
        String stockName,
        int holdingQuantity,
        BigDecimal avgPurchasePrice,
        BigDecimal totalInvestment,
        BigDecimal realizedPnl,
        double realizedPnlRate
) {}
