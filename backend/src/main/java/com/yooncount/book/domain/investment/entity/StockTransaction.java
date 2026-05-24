package com.yooncount.book.domain.investment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transaction")
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String ticker;

    @Column(name = "stock_name", nullable = false, length = 100)
    private String stockName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TradeType type;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal fee;

    @Column(name = "traded_at", nullable = false)
    private LocalDate tradedAt;

    @Column(length = 255)
    private String memo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected StockTransaction() {}

    public StockTransaction(String ticker, String stockName, TradeType type,
                             int quantity, BigDecimal price, BigDecimal fee,
                             LocalDate tradedAt, String memo) {
        this.ticker = ticker.toUpperCase();
        this.stockName = stockName;
        this.type = type;
        this.quantity = quantity;
        this.price = price;
        this.fee = fee;
        this.tradedAt = tradedAt;
        this.memo = memo;
    }

    public Long getId() { return id; }
    public String getTicker() { return ticker; }
    public String getStockName() { return stockName; }
    public TradeType getType() { return type; }
    public int getQuantity() { return quantity; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getFee() { return fee; }
    public LocalDate getTradedAt() { return tradedAt; }
    public String getMemo() { return memo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
