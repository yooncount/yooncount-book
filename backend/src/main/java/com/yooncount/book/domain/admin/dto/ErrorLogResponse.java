package com.yooncount.book.domain.admin.dto;

import com.yooncount.book.global.logging.ErrorLog;

import java.time.LocalDateTime;

public record ErrorLogResponse(
        Long id,
        LocalDateTime occurredAt,
        String method,
        String path,
        Long userId,
        String message,
        String stackTrace
) {
    public static ErrorLogResponse from(ErrorLog log) {
        return new ErrorLogResponse(
                log.getId(),
                log.getOccurredAt(),
                log.getMethod(),
                log.getPath(),
                log.getUserId(),
                log.getMessage(),
                log.getStackTrace()
        );
    }
}
