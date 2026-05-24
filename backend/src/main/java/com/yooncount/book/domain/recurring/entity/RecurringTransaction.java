package com.yooncount.book.domain.recurring.entity;

import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.domain.payment.entity.PaymentMethod;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.global.common.TransactionType;
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
@Table(name = "recurring_transaction")
public class RecurringTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id")
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 255)
    private String description;

    @Column(name = "day_of_month", nullable = false)
    private int dayOfMonth;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected RecurringTransaction() {}

    public RecurringTransaction(User owner, String name, TransactionType type, Category category,
                                PaymentMethod paymentMethod, BigDecimal amount, String description,
                                int dayOfMonth, LocalDate startDate, LocalDate endDate) {
        this.owner = owner;
        this.name = name;
        this.type = type;
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.description = description;
        this.dayOfMonth = dayOfMonth;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public void update(String name, TransactionType type, Category category,
                       PaymentMethod paymentMethod, BigDecimal amount, String description,
                       int dayOfMonth, LocalDate startDate, LocalDate endDate) {
        this.name = name;
        this.type = type;
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.description = description;
        this.dayOfMonth = dayOfMonth;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public void deactivate() { this.isActive = false; }
    public void activate()   { this.isActive = true; }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public String getName() { return name; }
    public TransactionType getType() { return type; }
    public Category getCategory() { return category; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public BigDecimal getAmount() { return amount; }
    public String getDescription() { return description; }
    public int getDayOfMonth() { return dayOfMonth; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public boolean isActive() { return isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
