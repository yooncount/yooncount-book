package com.yooncount.book.global.logging;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "error_log")
public class ErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(name = "occurred_at", nullable = false, updatable = false)
    private LocalDateTime occurredAt;

    @Column(length = 10)
    private String method;

    @Column(length = 500)
    private String path;

    @Column(name = "user_id")
    private Long userId;

    @Column(length = 1000)
    private String message;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    protected ErrorLog() {}

    public ErrorLog(String method, String path, Long userId, String message, String stackTrace) {
        this.method = method;
        this.path = path;
        this.userId = userId;
        this.message = message;
        this.stackTrace = stackTrace;
    }

    public Long getId() { return id; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
    public String getMethod() { return method; }
    public String getPath() { return path; }
    public Long getUserId() { return userId; }
    public String getMessage() { return message; }
    public String getStackTrace() { return stackTrace; }
}
