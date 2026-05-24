package com.yooncount.book.domain.transaction.controller;

import com.yooncount.book.domain.transaction.dto.TransactionCreateRequest;
import com.yooncount.book.domain.transaction.dto.TransactionResponse;
import com.yooncount.book.domain.transaction.dto.TransactionUpdateRequest;
import com.yooncount.book.domain.transaction.service.TransactionService;
import com.yooncount.book.global.common.ApiResponse;
import com.yooncount.book.global.common.TransactionType;
import com.yooncount.book.global.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transaction", description = "거래 관리 API")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    @Operation(summary = "거래 목록 조회", description = "year, month 필수. type(INCOME/EXPENSE), categoryId 선택 필터.")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> findAll(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(ApiResponse.ok(
                transactionService.findAll(principal.getId(), year, month, type, categoryId)));
    }

    @PostMapping
    @Operation(summary = "거래 등록")
    public ResponseEntity<ApiResponse<TransactionResponse>> create(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid TransactionCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(transactionService.create(principal.getId(), request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "거래 수정")
    public ResponseEntity<ApiResponse<TransactionResponse>> update(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody @Valid TransactionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.update(principal.getId(), id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "거래 삭제")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        transactionService.delete(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
