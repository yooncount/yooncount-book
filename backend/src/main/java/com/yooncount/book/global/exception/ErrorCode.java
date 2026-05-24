package com.yooncount.book.global.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    // Common
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "잘못된 입력값입니다."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 리소스를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),

    // Transaction
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "거래 내역을 찾을 수 없습니다."),

    // Category
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."),
    CATEGORY_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 존재하는 카테고리입니다."),
    CANNOT_DELETE_DEFAULT_CATEGORY(HttpStatus.BAD_REQUEST, "기본 카테고리는 삭제할 수 없습니다."),

    // Budget
    BUDGET_NOT_FOUND(HttpStatus.NOT_FOUND, "예산을 찾을 수 없습니다."),

    // Investment
    STOCK_TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "주식 거래 내역을 찾을 수 없습니다."),

    // Trading Journal
    TRADING_JOURNAL_NOT_FOUND(HttpStatus.NOT_FOUND, "매매 일지를 찾을 수 없습니다."),

    // Loan
    LOAN_NOT_FOUND(HttpStatus.NOT_FOUND, "대출을 찾을 수 없습니다."),

    // Payment Method
    PAYMENT_METHOD_NOT_FOUND(HttpStatus.NOT_FOUND, "결제 수단을 찾을 수 없습니다."),

    // Recurring Transaction
    RECURRING_TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "정기 거래를 찾을 수 없습니다."),

    // Savings Goal
    SAVINGS_GOAL_NOT_FOUND(HttpStatus.NOT_FOUND, "저축 목표를 찾을 수 없습니다."),

    // Finnhub
    FINNHUB_API_KEY_NOT_CONFIGURED(HttpStatus.SERVICE_UNAVAILABLE,
            "Finnhub API 키가 설정되지 않았습니다. " +
            "application-local.yml의 finnhub.api-key를 설정해주세요. " +
            "(https://finnhub.io 에서 무료 발급 가능)"),

    // GitHub
    GITHUB_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "GitHub 이슈 등록에 실패했습니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() { return status; }
    public String getMessage() { return message; }
}
