package com.yooncount.book.domain.investment.repository;

import com.yooncount.book.domain.investment.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    List<StockTransaction> findByTickerOrderByTradedAtAscCreatedAtAsc(String ticker);

    @Query("SELECT DISTINCT s.ticker FROM StockTransaction s ORDER BY s.ticker")
    List<String> findAllTickers();

    List<StockTransaction> findAllByOrderByTradedAtDescCreatedAtDesc();

    List<StockTransaction> findByTickerOrderByTradedAtDescCreatedAtDesc(String ticker);
}
