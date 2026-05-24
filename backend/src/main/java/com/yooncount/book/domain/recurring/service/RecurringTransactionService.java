package com.yooncount.book.domain.recurring.service;

import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.domain.category.repository.CategoryRepository;
import com.yooncount.book.domain.payment.entity.PaymentMethod;
import com.yooncount.book.domain.payment.repository.PaymentMethodRepository;
import com.yooncount.book.domain.recurring.dto.RecurringTransactionRequest;
import com.yooncount.book.domain.recurring.dto.RecurringTransactionResponse;
import com.yooncount.book.domain.recurring.entity.RecurringTransaction;
import com.yooncount.book.domain.recurring.repository.RecurringTransactionRepository;
import com.yooncount.book.domain.transaction.entity.Transaction;
import com.yooncount.book.domain.transaction.repository.TransactionRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public RecurringTransactionService(RecurringTransactionRepository recurringRepository,
                                       CategoryRepository categoryRepository,
                                       PaymentMethodRepository paymentMethodRepository,
                                       TransactionRepository transactionRepository,
                                       UserRepository userRepository) {
        this.recurringRepository = recurringRepository;
        this.categoryRepository = categoryRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public List<RecurringTransactionResponse> getAll(Long ownerId) {
        return recurringRepository.findAllWithDetails(ownerId)
                .stream()
                .map(RecurringTransactionResponse::from)
                .toList();
    }

    @Transactional
    public RecurringTransactionResponse create(Long ownerId, RecurringTransactionRequest request) {
        User owner = userRepository.getReferenceById(ownerId);
        Category category = findCategory(ownerId, request.categoryId());
        PaymentMethod pm = resolvePaymentMethod(ownerId, request.paymentMethodId());
        RecurringTransaction recurring = new RecurringTransaction(
                owner, request.name(), request.type(), category, pm,
                request.amount(), request.description(),
                request.dayOfMonth(), request.startDate(), request.endDate()
        );
        return RecurringTransactionResponse.from(recurringRepository.save(recurring));
    }

    @Transactional
    public RecurringTransactionResponse update(Long ownerId, Long id, RecurringTransactionRequest request) {
        RecurringTransaction recurring = findByIdAndOwnerId(ownerId, id);
        Category category = findCategory(ownerId, request.categoryId());
        PaymentMethod pm = resolvePaymentMethod(ownerId, request.paymentMethodId());
        recurring.update(request.name(), request.type(), category, pm,
                request.amount(), request.description(),
                request.dayOfMonth(), request.startDate(), request.endDate());
        return RecurringTransactionResponse.from(recurring);
    }

    @Transactional
    public RecurringTransactionResponse toggleActive(Long ownerId, Long id) {
        RecurringTransaction recurring = findByIdAndOwnerId(ownerId, id);
        if (recurring.isActive()) recurring.deactivate();
        else recurring.activate();
        return RecurringTransactionResponse.from(recurring);
    }

    /**
     * 이번 달 실제 거래로 등록 — 해당 달 dayOfMonth 날짜로 Transaction 생성
     */
    @Transactional
    public void applyToThisMonth(Long ownerId, Long id) {
        RecurringTransaction r = findByIdAndOwnerId(ownerId, id);
        if (!r.isActive()) throw new BusinessException(ErrorCode.RECURRING_TRANSACTION_NOT_FOUND);

        LocalDate now = LocalDate.now();
        int lastDay = now.withDayOfMonth(now.lengthOfMonth()).getDayOfMonth();
        int day = Math.min(r.getDayOfMonth(), lastDay);
        LocalDate txDate = now.withDayOfMonth(day);

        User owner = r.getOwner();
        Transaction tx = new Transaction(
                owner, r.getAmount(), r.getType(), r.getCategory(),
                r.getPaymentMethod(), r.getDescription(), txDate
        );
        transactionRepository.save(tx);
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        RecurringTransaction recurring = findByIdAndOwnerId(ownerId, id);
        recurringRepository.delete(recurring);
    }

    private RecurringTransaction findByIdAndOwnerId(Long ownerId, Long id) {
        return recurringRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RECURRING_TRANSACTION_NOT_FOUND));
    }

    private Category findCategory(Long ownerId, Long categoryId) {
        return categoryRepository.findByIdAndOwnerId(categoryId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    private PaymentMethod resolvePaymentMethod(Long ownerId, Long pmId) {
        if (pmId == null) return null;
        return paymentMethodRepository.findByIdAndOwnerId(pmId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
    }
}
