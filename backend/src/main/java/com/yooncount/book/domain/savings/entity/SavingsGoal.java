package com.yooncount.book.domain.savings.entity;

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
@Table(name = "savings_goal")
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "target_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal targetAmount;

    @Column(name = "saved_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal savedAmount = BigDecimal.ZERO;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(name = "is_completed", nullable = false)
    private boolean isCompleted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected SavingsGoal() {}

    public SavingsGoal(User owner, String name, BigDecimal targetAmount, BigDecimal savedAmount,
                       LocalDate targetDate, String memo) {
        this.owner = owner;
        this.name = name;
        this.targetAmount = targetAmount;
        this.savedAmount = (savedAmount != null) ? savedAmount : BigDecimal.ZERO;
        this.targetDate = targetDate;
        this.memo = memo;
    }

    public void update(String name, BigDecimal targetAmount, LocalDate targetDate, String memo) {
        this.name = name;
        this.targetAmount = targetAmount;
        this.targetDate = targetDate;
        this.memo = memo;
    }

    public void deposit(BigDecimal amount) {
        this.savedAmount = this.savedAmount.add(amount);
        if (this.savedAmount.compareTo(this.targetAmount) >= 0) {
            this.isCompleted = true;
        }
    }

    public void complete() { this.isCompleted = true; }
    public void reopen()   { this.isCompleted = false; }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public String getName() { return name; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public BigDecimal getSavedAmount() { return savedAmount; }
    public LocalDate getTargetDate() { return targetDate; }
    public String getMemo() { return memo; }
    public boolean isCompleted() { return isCompleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
