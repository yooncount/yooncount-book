package com.yooncount.book.domain.loan.entity;

import com.yooncount.book.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "loan")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String lender;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal principal;

    @Column(name = "remaining_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal remainingBalance;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "include_in_assets", nullable = false)
    private boolean includeInAssets = false;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Loan() {}

    public Loan(User owner, String name, String lender, BigDecimal principal, BigDecimal remainingBalance,
                BigDecimal interestRate, LocalDate startDate, LocalDate endDate,
                boolean includeInAssets, String memo) {
        this.owner = owner;
        this.name = name;
        this.lender = lender;
        this.principal = principal;
        this.remainingBalance = remainingBalance;
        this.interestRate = interestRate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.includeInAssets = includeInAssets;
        this.memo = memo;
    }

    public void update(String name, String lender, BigDecimal principal, BigDecimal remainingBalance,
                       BigDecimal interestRate, LocalDate startDate, LocalDate endDate,
                       boolean includeInAssets, String memo) {
        this.name = name;
        this.lender = lender;
        this.principal = principal;
        this.remainingBalance = remainingBalance;
        this.interestRate = interestRate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.includeInAssets = includeInAssets;
        this.memo = memo;
    }

    public void toggleIncludeInAssets() {
        this.includeInAssets = !this.includeInAssets;
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public String getName() { return name; }
    public String getLender() { return lender; }
    public BigDecimal getPrincipal() { return principal; }
    public BigDecimal getRemainingBalance() { return remainingBalance; }
    public BigDecimal getInterestRate() { return interestRate; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public boolean isIncludeInAssets() { return includeInAssets; }
    public String getMemo() { return memo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
