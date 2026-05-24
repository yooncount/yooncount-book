package com.yooncount.book.domain.investment.service;

import com.yooncount.book.domain.investment.dto.PortfolioQuoteResponse;
import com.yooncount.book.domain.investment.dto.PortfolioResponse;
import com.yooncount.book.domain.investment.dto.StockQuoteResponse;
import com.yooncount.book.domain.investment.dto.StockTransactionRequest;
import com.yooncount.book.domain.investment.dto.StockTransactionResponse;
import com.yooncount.book.domain.investment.entity.StockTransaction;
import com.yooncount.book.domain.investment.entity.TradeType;
import com.yooncount.book.domain.investment.repository.StockTransactionRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class InvestmentService {

    private final StockTransactionRepository repository;
    private final UserRepository userRepository;
    private final FinnhubService finnhubService;

    public InvestmentService(StockTransactionRepository repository,
                             UserRepository userRepository,
                             FinnhubService finnhubService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.finnhubService = finnhubService;
    }

    public List<StockTransactionResponse> findTransactions(Long ownerId, String ticker) {
        List<StockTransaction> txs = ticker != null
                ? repository.findByTickerAndOwnerIdOrderByTradedAtDescCreatedAtDesc(ticker.toUpperCase(), ownerId)
                : repository.findAllByOwnerIdOrderByTradedAtDescCreatedAtDesc(ownerId);
        return txs.stream().map(StockTransactionResponse::from).toList();
    }

    @Transactional
    public StockTransactionResponse create(Long ownerId, StockTransactionRequest request) {
        User owner = userRepository.getReferenceById(ownerId);
        StockTransaction tx = new StockTransaction(
                owner, request.ticker(), request.stockName(), request.type(),
                request.quantity(), request.price(), request.feeOrZero(),
                request.tradedAt(), request.memo()
        );
        return StockTransactionResponse.from(repository.save(tx));
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        StockTransaction tx = repository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STOCK_TRANSACTION_NOT_FOUND));
        repository.delete(tx);
    }

    public List<PortfolioResponse> getPortfolio(Long ownerId) {
        return repository.findAllTickersByOwnerId(ownerId).stream()
                .map(ticker -> calculatePortfolio(ticker,
                        repository.findByTickerAndOwnerIdOrderByTradedAtAscCreatedAtAsc(ticker, ownerId)))
                .filter(p -> p.holdingQuantity() > 0 || p.realizedPnl().compareTo(BigDecimal.ZERO) != 0)
                .toList();
    }

    /**
     * 보유 종목 전체에 대해 현재가를 일괄 조회하여 평가손익까지 계산해 반환.
     * 시세 조회는 종목별로 독립 실패 가능 — 실패 시 quoteError에 사유를 담는다.
     */
    public List<PortfolioQuoteResponse> getPortfolioWithQuotes(Long ownerId) {
        return getPortfolio(ownerId).stream()
                .map(p -> enrichWithQuote(ownerId, p))
                .toList();
    }

    private PortfolioQuoteResponse enrichWithQuote(Long ownerId, PortfolioResponse p) {
        BigDecimal currentPrice = null;
        BigDecimal marketValue = null;
        BigDecimal unrealizedPnl = null;
        Double unrealizedPnlRate = null;
        String quoteError = null;

        if (p.holdingQuantity() > 0) {
            try {
                StockQuoteResponse quote = finnhubService.getQuote(ownerId, p.ticker(), p.stockName());
                currentPrice = quote.currentPrice();
                marketValue = currentPrice.multiply(BigDecimal.valueOf(p.holdingQuantity()));
                unrealizedPnl = marketValue.subtract(p.totalInvestment()).setScale(2, RoundingMode.HALF_UP);
                if (p.totalInvestment().compareTo(BigDecimal.ZERO) > 0) {
                    unrealizedPnlRate = unrealizedPnl
                            .divide(p.totalInvestment(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .setScale(2, RoundingMode.HALF_UP)
                            .doubleValue();
                }
            } catch (BusinessException e) {
                quoteError = e.getMessage();
            } catch (Exception e) {
                quoteError = "시세 조회 실패";
            }
        }

        BigDecimal totalPnl = unrealizedPnl == null
                ? p.realizedPnl()
                : p.realizedPnl().add(unrealizedPnl).setScale(2, RoundingMode.HALF_UP);

        Double totalPnlRate = null;
        BigDecimal denominator = p.totalInvestment().add(p.realizedPnl().abs());
        if (denominator.compareTo(BigDecimal.ZERO) > 0 && (unrealizedPnl != null || p.realizedPnl().signum() != 0)) {
            totalPnlRate = totalPnl
                    .divide(denominator, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return new PortfolioQuoteResponse(
                p.ticker(), p.stockName(), p.holdingQuantity(),
                p.avgPurchasePrice(), p.totalInvestment(),
                p.realizedPnl(), p.realizedPnlRate(),
                currentPrice, marketValue, unrealizedPnl, unrealizedPnlRate,
                totalPnl, totalPnlRate, quoteError
        );
    }

    // 평균단가법으로 보유 수량, 평균 매수 단가, 실현 손익 계산
    private PortfolioResponse calculatePortfolio(String ticker, List<StockTransaction> txs) {
        String stockName = txs.get(0).getStockName();
        BigDecimal costBasis = BigDecimal.ZERO;  // 현재 보유분의 총 취득 원가
        int holdingQty = 0;
        BigDecimal realizedPnl = BigDecimal.ZERO;

        for (StockTransaction tx : txs) {
            if (tx.getType() == TradeType.BUY) {
                costBasis = costBasis.add(
                        tx.getPrice().multiply(BigDecimal.valueOf(tx.getQuantity()))
                                .add(tx.getFee())
                );
                holdingQty += tx.getQuantity();

            } else { // SELL
                if (holdingQty > 0) {
                    BigDecimal avgCost = costBasis.divide(
                            BigDecimal.valueOf(holdingQty), 4, RoundingMode.HALF_UP);

                    BigDecimal proceeds = tx.getPrice()
                            .multiply(BigDecimal.valueOf(tx.getQuantity()))
                            .subtract(tx.getFee());
                    BigDecimal cost = avgCost.multiply(BigDecimal.valueOf(tx.getQuantity()));

                    realizedPnl = realizedPnl.add(proceeds.subtract(cost));
                    costBasis = costBasis.subtract(cost);
                    holdingQty -= tx.getQuantity();
                }
            }
        }

        BigDecimal avgPurchasePrice = holdingQty > 0
                ? costBasis.divide(BigDecimal.valueOf(holdingQty), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal totalInvestment = avgPurchasePrice.multiply(BigDecimal.valueOf(holdingQty));

        double realizedPnlRate = costBasis.add(realizedPnl).compareTo(BigDecimal.ZERO) == 0 ? 0.0
                : realizedPnl
                        .divide(costBasis.add(realizedPnl).abs(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP)
                        .doubleValue();

        return new PortfolioResponse(
                ticker, stockName, holdingQty,
                avgPurchasePrice, totalInvestment,
                realizedPnl.setScale(2, RoundingMode.HALF_UP),
                realizedPnlRate
        );
    }
}
