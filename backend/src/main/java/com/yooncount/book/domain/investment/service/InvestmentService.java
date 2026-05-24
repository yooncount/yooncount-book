package com.yooncount.book.domain.investment.service;

import com.yooncount.book.domain.investment.dto.PortfolioResponse;
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

    public InvestmentService(StockTransactionRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
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
