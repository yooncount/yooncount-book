package com.yooncount.book.domain.statistics.dto;

import java.math.BigDecimal;
import java.util.List;

public record AnnualStatisticsResponse(
        int year,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal netSaving,
        List<MonthSummary> monthly
) {
    public record MonthSummary(
            int month,
            BigDecimal income,
            BigDecimal expense,
            BigDecimal net
    ) {}
}
