package com.yooncount.book.domain.payment.repository;

import com.yooncount.book.domain.payment.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
}
