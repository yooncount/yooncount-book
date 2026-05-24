package com.yooncount.book.domain.admin.dto;

public record AdminStatsResponse(
        long totalUsers,
        long newUsers7d,
        long newUsers30d,
        long activeUsers30d,
        long totalTransactions,
        long totalErrors7d
) {}
