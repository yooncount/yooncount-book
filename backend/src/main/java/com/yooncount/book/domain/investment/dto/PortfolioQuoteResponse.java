package com.yooncount.book.domain.investment.dto;

import java.math.BigDecimal;

/**
 * 보유 종목 + 현재가 + 평가손익(미실현) + 총 손익까지 합친 응답.
 * 시세 조회 실패 시 currentPrice/marketValue/unrealizedPnl/unrealizedPnlRate는 null,
 * quoteError에 사유를 담아 부분 실패를 표현한다.
 */
public record PortfolioQuoteResponse(
        String ticker,
        String stockName,
        int holdingQuantity,
        BigDecimal avgPurchasePrice,
        BigDecimal totalInvestment,
        BigDecimal realizedPnl,
        double realizedPnlRate,
        BigDecimal currentPrice,
        BigDecimal marketValue,
        BigDecimal unrealizedPnl,
        Double unrealizedPnlRate,
        BigDecimal totalPnl,
        Double totalPnlRate,
        String quoteError
) {}
