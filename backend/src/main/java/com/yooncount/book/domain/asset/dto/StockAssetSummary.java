package com.yooncount.book.domain.asset.dto;

import com.yooncount.book.domain.investment.dto.PortfolioResponse;

import java.math.BigDecimal;

public record StockAssetSummary(
        String ticker,
        String stockName,
        int holdingQuantity,
        BigDecimal avgPurchasePrice,
        BigDecimal totalInvestment
) {
    public static StockAssetSummary from(PortfolioResponse p) {
        return new StockAssetSummary(
                p.ticker(), p.stockName(),
                p.holdingQuantity(), p.avgPurchasePrice(), p.totalInvestment()
        );
    }
}
