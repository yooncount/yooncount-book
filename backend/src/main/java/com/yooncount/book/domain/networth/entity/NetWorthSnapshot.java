package com.yooncount.book.domain.networth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "net_worth_snapshot")
public class NetWorthSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "cash_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal cashBalance;

    @Column(name = "stock_investment", nullable = false, precision = 15, scale = 2)
    private BigDecimal stockInvestment;

    @Column(name = "realized_stock_pnl", nullable = false, precision = 15, scale = 2)
    private BigDecimal realizedStockPnl;

    @Column(name = "gross_assets", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossAssets;

    @Column(name = "total_debt", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalDebt;

    @Column(name = "net_assets", nullable = false, precision = 15, scale = 2)
    private BigDecimal netAssets;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected NetWorthSnapshot() {}

    public NetWorthSnapshot(LocalDate snapshotDate, BigDecimal cashBalance,
                            BigDecimal stockInvestment, BigDecimal realizedStockPnl,
                            BigDecimal grossAssets, BigDecimal totalDebt,
                            BigDecimal netAssets, String memo) {
        this.snapshotDate = snapshotDate;
        this.cashBalance = cashBalance;
        this.stockInvestment = stockInvestment;
        this.realizedStockPnl = realizedStockPnl;
        this.grossAssets = grossAssets;
        this.totalDebt = totalDebt;
        this.netAssets = netAssets;
        this.memo = memo;
    }

    public Long getId() { return id; }
    public LocalDate getSnapshotDate() { return snapshotDate; }
    public BigDecimal getCashBalance() { return cashBalance; }
    public BigDecimal getStockInvestment() { return stockInvestment; }
    public BigDecimal getRealizedStockPnl() { return realizedStockPnl; }
    public BigDecimal getGrossAssets() { return grossAssets; }
    public BigDecimal getTotalDebt() { return totalDebt; }
    public BigDecimal getNetAssets() { return netAssets; }
    public String getMemo() { return memo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
