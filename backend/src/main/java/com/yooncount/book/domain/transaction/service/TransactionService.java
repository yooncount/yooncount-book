package com.yooncount.book.domain.transaction.service;

import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.domain.category.repository.CategoryRepository;
import com.yooncount.book.domain.payment.entity.PaymentMethod;
import com.yooncount.book.domain.payment.repository.PaymentMethodRepository;
import com.yooncount.book.domain.transaction.dto.TransactionCreateRequest;
import com.yooncount.book.domain.transaction.dto.TransactionResponse;
import com.yooncount.book.domain.transaction.dto.TransactionUpdateRequest;
import com.yooncount.book.domain.transaction.entity.Transaction;
import com.yooncount.book.domain.transaction.repository.TransactionRepository;
import com.yooncount.book.global.common.TransactionType;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentMethodRepository paymentMethodRepository;

    public TransactionService(TransactionRepository transactionRepository,
                               CategoryRepository categoryRepository,
                               PaymentMethodRepository paymentMethodRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.paymentMethodRepository = paymentMethodRepository;
    }

    public List<TransactionResponse> findAll(int year, int month,
                                              TransactionType type, Long categoryId) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return transactionRepository.findByFilter(startDate, endDate, type, categoryId)
                .stream()
                .map(TransactionResponse::from)
                .toList();
    }

    @Transactional
    public TransactionResponse create(TransactionCreateRequest request) {
        Category category = findCategory(request.categoryId());
        PaymentMethod paymentMethod = resolvePaymentMethod(request.paymentMethodId());
        Transaction transaction = new Transaction(
                request.amount(), request.type(), category,
                paymentMethod, request.description(), request.transactionDate()
        );
        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse update(Long id, TransactionUpdateRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND));
        Category category = findCategory(request.categoryId());
        PaymentMethod paymentMethod = resolvePaymentMethod(request.paymentMethodId());
        transaction.update(request.amount(), request.type(), category,
                paymentMethod, request.description(), request.transactionDate());
        return TransactionResponse.from(transaction);
    }

    @Transactional
    public void delete(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND));
        transactionRepository.delete(transaction);
    }

    private Category findCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    private PaymentMethod resolvePaymentMethod(Long paymentMethodId) {
        if (paymentMethodId == null) return null;
        return paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
    }
}
