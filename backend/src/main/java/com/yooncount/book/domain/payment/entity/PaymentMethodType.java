package com.yooncount.book.domain.payment.entity;

public enum PaymentMethodType {
    CREDIT_CARD,   // 신용카드
    DEBIT_CARD,    // 체크카드
    CASH,          // 현금
    BANK_TRANSFER, // 계좌이체
    OTHER
}
