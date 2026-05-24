package com.yooncount.book.domain.journal.entity;

import com.yooncount.book.domain.investment.entity.TradeType;
import com.yooncount.book.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trading_journal")
public class TradingJournal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 20)
    private String ticker;

    @Column(name = "stock_name", nullable = false, length = 100)
    private String stockName;

    @Enumerated(EnumType.STRING)
    @Column(name = "trade_type", nullable = false, length = 10)
    private TradeType tradeType;

    @Column(name = "trade_date", nullable = false)
    private LocalDate tradeDate;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(length = 255)
    private String strategy;

    @Column(columnDefinition = "TEXT")
    private String reflection;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected TradingJournal() {}

    public TradingJournal(User owner, String ticker, String stockName, TradeType tradeType,
                          LocalDate tradeDate, int quantity, BigDecimal price,
                          String reason, String strategy, String reflection) {
        this.owner = owner;
        this.ticker = ticker.toUpperCase();
        this.stockName = stockName;
        this.tradeType = tradeType;
        this.tradeDate = tradeDate;
        this.quantity = quantity;
        this.price = price;
        this.reason = reason;
        this.strategy = strategy;
        this.reflection = reflection;
    }

    public void update(LocalDate tradeDate, int quantity, BigDecimal price,
                       String reason, String strategy, String reflection) {
        this.tradeDate = tradeDate;
        this.quantity = quantity;
        this.price = price;
        this.reason = reason;
        this.strategy = strategy;
        this.reflection = reflection;
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public String getTicker() { return ticker; }
    public String getStockName() { return stockName; }
    public TradeType getTradeType() { return tradeType; }
    public LocalDate getTradeDate() { return tradeDate; }
    public int getQuantity() { return quantity; }
    public BigDecimal getPrice() { return price; }
    public String getReason() { return reason; }
    public String getStrategy() { return strategy; }
    public String getReflection() { return reflection; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
