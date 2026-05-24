package com.yooncount.book.domain.budget.service;

import com.yooncount.book.domain.budget.dto.BudgetRequest;
import com.yooncount.book.domain.budget.dto.BudgetResponse;
import com.yooncount.book.domain.budget.entity.Budget;
import com.yooncount.book.domain.budget.repository.BudgetRepository;
import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.domain.category.repository.CategoryRepository;
import com.yooncount.book.domain.transaction.repository.TransactionRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
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
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository,
                         CategoryRepository categoryRepository,
                         TransactionRepository transactionRepository,
                         UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public List<BudgetResponse> findByMonth(Long ownerId, int year, int month) {
        List<Budget> budgets = budgetRepository.findByYearAndMonth(ownerId, year, month);
        Map<Long, BigDecimal> spentMap = getSpentMapForMonth(ownerId, year, month);
        return budgets.stream()
                .map(b -> BudgetResponse.of(b, spentMap.getOrDefault(b.getCategory().getId(), BigDecimal.ZERO)))
                .toList();
    }

    @Transactional
    public BudgetResponse save(Long ownerId, BudgetRequest request) {
        Budget budget = budgetRepository
                .findByOwnerIdAndCategoryIdAndYearAndMonth(ownerId, request.categoryId(), request.year(), request.month())
                .map(existing -> {
                    existing.updateAmount(request.budgetAmount());
                    return existing;
                })
                .orElseGet(() -> {
                    User owner = userRepository.getReferenceById(ownerId);
                    Category category = categoryRepository.findByIdAndOwnerId(request.categoryId(), ownerId)
                            .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
                    return budgetRepository.save(new Budget(owner, category, request.year(), request.month(), request.budgetAmount()));
                });

        Map<Long, BigDecimal> spentMap = getSpentMapForMonth(ownerId, request.year(), request.month());
        BigDecimal spent = spentMap.getOrDefault(budget.getCategory().getId(), BigDecimal.ZERO);
        return BudgetResponse.of(budget, spent);
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        Budget budget = budgetRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUDGET_NOT_FOUND));
        budgetRepository.delete(budget);
    }

    private Map<Long, BigDecimal> getSpentMapForMonth(Long ownerId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return transactionRepository
                .sumAmountByCategoryAndType(ownerId, startDate, endDate, TransactionType.EXPENSE)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (BigDecimal) row[1]
                ));
    }
}
