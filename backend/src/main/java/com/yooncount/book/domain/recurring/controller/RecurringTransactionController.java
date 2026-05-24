package com.yooncount.book.domain.recurring.controller;

import com.yooncount.book.domain.recurring.dto.RecurringTransactionRequest;
import com.yooncount.book.domain.recurring.dto.RecurringTransactionResponse;
import com.yooncount.book.domain.recurring.service.RecurringTransactionService;
import com.yooncount.book.global.common.ApiResponse;
import com.yooncount.book.global.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recurring")
@Tag(name = "Recurring", description = "정기 지출/수입 관리 API")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringService;

    public RecurringTransactionController(RecurringTransactionService recurringService) {
        this.recurringService = recurringService;
    }

    @GetMapping
    @Operation(summary = "정기 거래 목록 조회")
    public ResponseEntity<ApiResponse<List<RecurringTransactionResponse>>> getAll(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(recurringService.getAll(principal.getId())));
    }

    @PostMapping
    @Operation(summary = "정기 거래 등록")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> create(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid RecurringTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(recurringService.create(principal.getId(), request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "정기 거래 수정")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> update(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody @Valid RecurringTransactionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(recurringService.update(principal.getId(), id, request)));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "정기 거래 활성/비활성 전환")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> toggleActive(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(recurringService.toggleActive(principal.getId(), id)));
    }

    @PostMapping("/{id}/apply")
    @Operation(summary = "이번 달 거래로 등록",
               description = "정기 거래를 이번 달 실제 거래로 즉시 등록합니다.")
    public ResponseEntity<ApiResponse<Void>> applyToThisMonth(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        recurringService.applyToThisMonth(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "정기 거래 삭제")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        recurringService.delete(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
