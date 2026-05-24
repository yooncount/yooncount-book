package com.yooncount.book.domain.statistics.service;

import com.yooncount.book.domain.statistics.dto.AnnualStatisticsResponse;
import com.yooncount.book.domain.statistics.dto.CategoryStatistics;
import com.yooncount.book.domain.statistics.dto.CategoryTrendResponse;
import com.yooncount.book.domain.statistics.dto.MonthlyStatisticsResponse;
import com.yooncount.book.domain.transaction.repository.TransactionRepository;
import com.yooncount.book.global.common.TransactionType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class StatisticsService {

    private final TransactionRepository transactionRepository;

    public StatisticsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public MonthlyStatisticsResponse getMonthlyStatistics(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Object[]> rows = transactionRepository.sumGroupedByCategoryAndType(startDate, endDate);

        List<CategoryStatistics> incomeRows = new ArrayList<>();
        List<CategoryStatistics> expenseRows = new ArrayList<>();
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Object[] row : rows) {
            TransactionType type = (TransactionType) row[0];
            Long categoryId = (Long) row[1];
            String categoryName = (String) row[2];
            BigDecimal amount = (BigDecimal) row[3];

            if (type == TransactionType.INCOME) {
                totalIncome = totalIncome.add(amount);
                incomeRows.add(new CategoryStatistics(categoryId, categoryName, amount, 0.0));
            } else {
                totalExpense = totalExpense.add(amount);
                expenseRows.add(new CategoryStatistics(categoryId, categoryName, amount, 0.0));
            }
        }

        return new MonthlyStatisticsResponse(
                year, month,
                totalIncome, totalExpense,
                totalIncome.subtract(totalExpense),
                applyRatio(incomeRows, totalIncome),
                applyRatio(expenseRows, totalExpense)
        );
    }

    public AnnualStatisticsResponse getAnnualStatistics(int year) {
        List<Object[]> rows = transactionRepository.sumByMonthAndType(year);

        Map<Integer, BigDecimal> incomeByMonth = new HashMap<>();
        Map<Integer, BigDecimal> expenseByMonth = new HashMap<>();

        for (Object[] row : rows) {
            int month = ((Number) row[0]).intValue();
            TransactionType type = (TransactionType) row[1];
            BigDecimal amount = (BigDecimal) row[2];

            if (type == TransactionType.INCOME) incomeByMonth.put(month, amount);
            else expenseByMonth.put(month, amount);
        }

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        List<AnnualStatisticsResponse.MonthSummary> monthly = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            BigDecimal income  = incomeByMonth.getOrDefault(m, BigDecimal.ZERO);
            BigDecimal expense = expenseByMonth.getOrDefault(m, BigDecimal.ZERO);
            totalIncome  = totalIncome.add(income);
            totalExpense = totalExpense.add(expense);
            monthly.add(new AnnualStatisticsResponse.MonthSummary(m, income, expense, income.subtract(expense)));
        }

        return new AnnualStatisticsResponse(year, totalIncome, totalExpense,
                totalIncome.subtract(totalExpense), monthly);
    }

    public CategoryTrendResponse getCategoryTrend(Long categoryId, int months) {
        LocalDate today     = LocalDate.now();
        LocalDate endDate   = today.withDayOfMonth(today.lengthOfMonth());
        LocalDate startDate = today.withDayOfMonth(1).minusMonths(months - 1L);

        List<Object[]> rows = transactionRepository.sumByYearMonthForCategory(
                categoryId, startDate, endDate);

        List<CategoryTrendResponse.MonthAmount> trend = rows.stream()
                .map(row -> new CategoryTrendResponse.MonthAmount(
                        ((Number) row[0]).intValue(),
                        ((Number) row[1]).intValue(),
                        (BigDecimal) row[2]))
                .toList();

        String categoryName = transactionRepository.sumGroupedByCategoryAndType(startDate, endDate)
                .stream()
                .filter(r -> ((Long) r[1]).equals(categoryId))
                .map(r -> (String) r[2])
                .findFirst()
                .orElse("카테고리 " + categoryId);

        return new CategoryTrendResponse(categoryId, categoryName, trend);
    }

    private List<CategoryStatistics> applyRatio(List<CategoryStatistics> rows, BigDecimal total) {
        if (total.compareTo(BigDecimal.ZERO) == 0) return rows;
        return rows.stream()
                .map(r -> new CategoryStatistics(
                        r.categoryId(), r.categoryName(), r.amount(),
                        r.amount()
                         .divide(total, 4, RoundingMode.HALF_UP)
                         .multiply(BigDecimal.valueOf(100))
                         .setScale(1, RoundingMode.HALF_UP)
                         .doubleValue()))
                .toList();
    }
}
