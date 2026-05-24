package com.yooncount.book.domain.payment.controller;

import com.yooncount.book.domain.payment.dto.PaymentMethodRequest;
import com.yooncount.book.domain.payment.dto.PaymentMethodResponse;
import com.yooncount.book.domain.payment.dto.PaymentMethodStatsResponse;
import com.yooncount.book.domain.payment.service.PaymentMethodService;
import com.yooncount.book.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
@Tag(name = "PaymentMethod", description = "결제 수단 관리 API")
@SuppressWarnings("unused")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

    @GetMapping
    @Operation(summary = "결제 수단 목록 조회")
    public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(paymentMethodService.getAll()));
    }

    @PostMapping
    @Operation(summary = "결제 수단 등록")
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> create(
            @RequestBody @Valid PaymentMethodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(paymentMethodService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "결제 수단 수정")
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> update(
            @PathVariable Long id,
            @RequestBody @Valid PaymentMethodRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(paymentMethodService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "결제 수단 삭제")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        paymentMethodService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @GetMapping("/stats")
    @Operation(summary = "결제 수단별 지출 통계",
               description = "특정 월의 결제 수단별 총 지출액과 카테고리별 내역을 조회합니다.")
    public ResponseEntity<ApiResponse<List<PaymentMethodStatsResponse>>> getStats(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        int y = (year != null) ? year : LocalDate.now().getYear();
        int m = (month != null) ? month : LocalDate.now().getMonthValue();
        return ResponseEntity.ok(ApiResponse.ok(paymentMethodService.getStats(y, m)));
    }
}
