package com.yooncount.book.domain.asset.dto;

import com.yooncount.book.domain.loan.dto.LoanResponse;

import java.math.BigDecimal;
import java.util.List;

public record AssetSummaryResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal cashBalance,
        BigDecimal stockInvestment,
        BigDecimal realizedStockPnl,
        BigDecimal grossAssets,
        BigDecimal totalDebt,
        BigDecimal netAssets,
        List<StockAssetSummary> stockPortfolio,
        List<LoanResponse> loans
) {}
