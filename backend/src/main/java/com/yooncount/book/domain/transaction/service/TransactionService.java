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
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
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
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository,
                               CategoryRepository categoryRepository,
                               PaymentMethodRepository paymentMethodRepository,
                               UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.userRepository = userRepository;
    }

    public List<TransactionResponse> findAll(Long ownerId, int year, int month,
                                              TransactionType type, Long categoryId) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return transactionRepository.findByFilter(ownerId, startDate, endDate, type, categoryId)
                .stream()
                .map(TransactionResponse::from)
                .toList();
    }

    @Transactional
    public TransactionResponse create(Long ownerId, TransactionCreateRequest request) {
        User owner = userRepository.getReferenceById(ownerId);
        Category category = findCategory(ownerId, request.categoryId());
        PaymentMethod paymentMethod = resolvePaymentMethod(ownerId, request.paymentMethodId());
        Transaction transaction = new Transaction(
                owner, request.amount(), request.type(), category,
                paymentMethod, request.description(), request.transactionDate()
        );
        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse update(Long ownerId, Long id, TransactionUpdateRequest request) {
        Transaction transaction = transactionRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND));
        Category category = findCategory(ownerId, request.categoryId());
        PaymentMethod paymentMethod = resolvePaymentMethod(ownerId, request.paymentMethodId());
        transaction.update(request.amount(), request.type(), category,
                paymentMethod, request.description(), request.transactionDate());
        return TransactionResponse.from(transaction);
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        Transaction transaction = transactionRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND));
        transactionRepository.delete(transaction);
    }

    private Category findCategory(Long ownerId, Long categoryId) {
        return categoryRepository.findByIdAndOwnerId(categoryId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    private PaymentMethod resolvePaymentMethod(Long ownerId, Long paymentMethodId) {
        if (paymentMethodId == null) return null;
        return paymentMethodRepository.findByIdAndOwnerId(paymentMethodId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
    }
}
