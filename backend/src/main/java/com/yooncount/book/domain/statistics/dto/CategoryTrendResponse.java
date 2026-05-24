package com.yooncount.book.domain.statistics.dto;

import java.math.BigDecimal;
import java.util.List;

public record CategoryTrendResponse(
        Long categoryId,
        String categoryName,
        List<MonthAmount> trend
) {
    public record MonthAmount(int year, int month, BigDecimal amount) {}
}
