package com.yooncount.book.domain.payment.service;

import com.yooncount.book.domain.payment.dto.PaymentMethodRequest;
import com.yooncount.book.domain.payment.dto.PaymentMethodResponse;
import com.yooncount.book.domain.payment.dto.PaymentMethodStatsResponse;
import com.yooncount.book.domain.payment.entity.PaymentMethod;
import com.yooncount.book.domain.payment.entity.PaymentMethodType;
import com.yooncount.book.domain.payment.repository.PaymentMethodRepository;
import com.yooncount.book.domain.transaction.repository.TransactionRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public PaymentMethodService(PaymentMethodRepository paymentMethodRepository,
                                TransactionRepository transactionRepository,
                                UserRepository userRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public List<PaymentMethodResponse> getAll(Long ownerId) {
        return paymentMethodRepository.findAllByOwnerId(ownerId)
                .stream()
                .map(PaymentMethodResponse::from)
                .toList();
    }

    @Transactional
    public PaymentMethodResponse create(Long ownerId, PaymentMethodRequest request) {
        User owner = userRepository.getReferenceById(ownerId);
        return PaymentMethodResponse.from(
                paymentMethodRepository.save(new PaymentMethod(owner, request.name(), request.type()))
        );
    }

    @Transactional
    public PaymentMethodResponse update(Long ownerId, Long id, PaymentMethodRequest request) {
        PaymentMethod pm = findByIdAndOwnerId(ownerId, id);
        pm.update(request.name(), request.type());
        return PaymentMethodResponse.from(pm);
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        if (!paymentMethodRepository.existsByIdAndOwnerId(id, ownerId)) {
            throw new BusinessException(ErrorCode.PAYMENT_METHOD_NOT_FOUND);
        }
        paymentMethodRepository.deleteById(id);
    }

    public List<PaymentMethodStatsResponse> getStats(Long ownerId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Object[]> rows = transactionRepository.sumByPaymentMethodAndCategory(ownerId, startDate, endDate);

        // Group by paymentMethodId preserving order
        Map<Long, PaymentMethodStatsBuilder> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            Long pmId       = (Long) row[0];
            String pmName   = (String) row[1];
            PaymentMethodType pmType = (PaymentMethodType) row[2];
            Long catId      = (Long) row[3];
            String catName  = (String) row[4];
            BigDecimal amt  = (BigDecimal) row[5];

            map.computeIfAbsent(pmId, k -> new PaymentMethodStatsBuilder(pmId, pmName, pmType))
               .addCategory(catId, catName, amt);
        }

        return map.values().stream()
                .map(PaymentMethodStatsBuilder::build)
                .toList();
    }

    private PaymentMethod findByIdAndOwnerId(Long ownerId, Long id) {
        return paymentMethodRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
    }

    private static class PaymentMethodStatsBuilder {
        private final Long id;
        private final String name;
        private final PaymentMethodType type;
        private BigDecimal total = BigDecimal.ZERO;
        private final List<PaymentMethodStatsResponse.CategoryBreakdown> categories = new ArrayList<>();

        PaymentMethodStatsBuilder(Long id, String name, PaymentMethodType type) {
            this.id = id;
            this.name = name;
            this.type = type;
        }

        void addCategory(Long catId, String catName, BigDecimal amount) {
            total = total.add(amount);
            categories.add(new PaymentMethodStatsResponse.CategoryBreakdown(catId, catName, amount));
        }

        PaymentMethodStatsResponse build() {
            return new PaymentMethodStatsResponse(id, name, type, total, categories);
        }
    }
}
