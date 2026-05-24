package com.yooncount.book.domain.budget.service;

import com.yooncount.book.domain.budget.dto.BudgetRequest;
import com.yooncount.book.domain.budget.dto.BudgetResponse;
import com.yooncount.book.domain.budget.entity.Budget;
import com.yooncount.book.domain.budget.repository.BudgetRepository;
import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.domain.category.repository.CategoryRepository;
import com.yooncount.book.domain.transaction.repository.TransactionRepository;
import com.yooncount.book.global.common.TransactionType;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository,
                         CategoryRepository categoryRepository,
                         TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<BudgetResponse> findByMonth(int year, int month) {
        List<Budget> budgets = budgetRepository.findByYearAndMonth(year, month);
        Map<Long, BigDecimal> spentMap = getSpentMapForMonth(year, month);
        return budgets.stream()
                .map(b -> BudgetResponse.of(b, spentMap.getOrDefault(b.getCategory().getId(), BigDecimal.ZERO)))
                .toList();
    }

    @Transactional
    public BudgetResponse save(BudgetRequest request) {
        Budget budget = budgetRepository
                .findByCategoryIdAndYearAndMonth(request.categoryId(), request.year(), request.month())
                .map(existing -> {
                    existing.updateAmount(request.amount());
                    return existing;
                })
                .orElseGet(() -> {
                    Category category = categoryRepository.findById(request.categoryId())
                            .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
                    return budgetRepository.save(new Budget(category, request.year(), request.month(), request.amount()));
                });

        Map<Long, BigDecimal> spentMap = getSpentMapForMonth(request.year(), request.month());
        BigDecimal spent = spentMap.getOrDefault(budget.getCategory().getId(), BigDecimal.ZERO);
        return BudgetResponse.of(budget, spent);
    }

    @Transactional
    public void delete(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUDGET_NOT_FOUND));
        budgetRepository.delete(budget);
    }

    private Map<Long, BigDecimal> getSpentMapForMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return transactionRepository
                .sumAmountByCategoryAndType(startDate, endDate, TransactionType.EXPENSE)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (BigDecimal) row[1]
                ));
    }
}
