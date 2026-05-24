package com.yooncount.book.domain.journal.repository;

import com.yooncount.book.domain.investment.entity.TradeType;
import com.yooncount.book.domain.journal.entity.TradingJournal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TradingJournalRepository extends JpaRepository<TradingJournal, Long> {

    @Query("SELECT j FROM TradingJournal j " +
           "WHERE (:ticker IS NULL OR j.ticker = :ticker) " +
           "AND (:tradeType IS NULL OR j.tradeType = :tradeType) " +
           "AND (:startDate IS NULL OR j.tradeDate >= :startDate) " +
           "AND (:endDate IS NULL OR j.tradeDate <= :endDate) " +
           "ORDER BY j.tradeDate DESC, j.createdAt DESC")
    List<TradingJournal> findByFilter(
            @Param("ticker")    String ticker,
            @Param("tradeType") TradeType tradeType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate
    );
}
