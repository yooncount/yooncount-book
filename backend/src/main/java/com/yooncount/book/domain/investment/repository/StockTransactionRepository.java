package com.yooncount.book.domain.investment.repository;

import com.yooncount.book.domain.investment.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    Optional<StockTransaction> findByIdAndOwnerId(Long id, Long ownerId);

    List<StockTransaction> findByTickerAndOwnerIdOrderByTradedAtAscCreatedAtAsc(String ticker, Long ownerId);

    @Query("SELECT DISTINCT s.ticker FROM StockTransaction s " +
           "WHERE s.owner.id = :ownerId ORDER BY s.ticker")
    List<String> findAllTickersByOwnerId(@Param("ownerId") Long ownerId);

    List<StockTransaction> findAllByOwnerIdOrderByTradedAtDescCreatedAtDesc(Long ownerId);

    List<StockTransaction> findByTickerAndOwnerIdOrderByTradedAtDescCreatedAtDesc(String ticker, Long ownerId);
}
