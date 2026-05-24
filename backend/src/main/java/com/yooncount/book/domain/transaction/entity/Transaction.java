package com.yooncount.book.domain.transaction.entity;

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
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id")
    private PaymentMethod paymentMethod;

    @Column(length = 255)
    private String description;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Transaction() {}

    public Transaction(User owner, BigDecimal amount, TransactionType type, Category category,
                       PaymentMethod paymentMethod, String description, LocalDate transactionDate) {
        this.owner = owner;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.description = description;
        this.transactionDate = transactionDate;
    }

    public void update(BigDecimal amount, TransactionType type, Category category,
                       PaymentMethod paymentMethod, String description, LocalDate transactionDate) {
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.description = description;
        this.transactionDate = transactionDate;
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public BigDecimal getAmount() { return amount; }
    public TransactionType getType() { return type; }
    public Category getCategory() { return category; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public String getDescription() { return description; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
