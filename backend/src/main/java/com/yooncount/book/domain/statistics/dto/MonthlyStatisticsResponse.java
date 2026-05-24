package com.yooncount.book.domain.statistics.dto;

import java.math.BigDecimal;
import java.util.List;

public record MonthlyStatisticsResponse(
        int year,
        int month,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance,
        List<CategoryStatistics> incomeByCategory,
        List<CategoryStatistics> expenseByCategory
) {}
