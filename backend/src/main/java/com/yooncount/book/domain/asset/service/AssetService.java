package com.yooncount.book.domain.asset.service;

import com.yooncount.book.domain.asset.dto.AssetSummaryResponse;
import com.yooncount.book.domain.asset.dto.StockAssetSummary;
import com.yooncount.book.domain.investment.dto.PortfolioResponse;
import com.yooncount.book.domain.investment.service.InvestmentService;
import com.yooncount.book.domain.loan.dto.LoanResponse;
import com.yooncount.book.domain.loan.repository.LoanRepository;
import com.yooncount.book.domain.transaction.repository.TransactionRepository;
import com.yooncount.book.global.common.TransactionType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AssetService {

    private final TransactionRepository transactionRepository;
    private final InvestmentService investmentService;
    private final LoanRepository loanRepository;

    public AssetService(TransactionRepository transactionRepository,
                        InvestmentService investmentService,
                        LoanRepository loanRepository) {
        this.transactionRepository = transactionRepository;
        this.investmentService = investmentService;
        this.loanRepository = loanRepository;
    }

    public AssetSummaryResponse getSummary(Long ownerId) {
        BigDecimal totalIncome  = transactionRepository.sumTotalByType(ownerId, TransactionType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumTotalByType(ownerId, TransactionType.EXPENSE);
        BigDecimal cashBalance  = totalIncome.subtract(totalExpense);

        List<PortfolioResponse> portfolio = investmentService.getPortfolio(ownerId);

        BigDecimal stockInvestment = portfolio.stream()
                .filter(p -> p.holdingQuantity() > 0)
                .map(PortfolioResponse::totalInvestment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal realizedStockPnl = portfolio.stream()
                .map(PortfolioResponse::realizedPnl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal grossAssets = cashBalance.add(stockInvestment).add(realizedStockPnl);

        BigDecimal totalDebt = loanRepository.sumRemainingBalanceIncludedInAssets(ownerId);
        BigDecimal netAssets = grossAssets.subtract(totalDebt);

        List<StockAssetSummary> stockPortfolio = portfolio.stream()
                .filter(p -> p.holdingQuantity() > 0)
                .map(StockAssetSummary::from)
                .toList();

        List<LoanResponse> loans = loanRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(LoanResponse::from)
                .toList();

        return new AssetSummaryResponse(
                totalIncome, totalExpense, cashBalance,
                stockInvestment, realizedStockPnl,
                grossAssets, totalDebt, netAssets,
                stockPortfolio, loans
        );
    }
}
