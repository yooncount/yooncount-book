package com.yooncount.book.domain.loan.controller;

import com.yooncount.book.domain.loan.dto.LoanRequest;
import com.yooncount.book.domain.loan.dto.LoanResponse;
import com.yooncount.book.domain.loan.service.LoanService;
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
@RequestMapping("/api/loans")
@Tag(name = "Loan", description = "대출 관리 API")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    @Operation(summary = "대출 목록 조회")
    public ResponseEntity<ApiResponse<List<LoanResponse>>> getLoans(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.getLoans(principal.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "대출 단건 조회")
    public ResponseEntity<ApiResponse<LoanResponse>> getLoan(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.getLoan(principal.getId(), id)));
    }

    @PostMapping
    @Operation(summary = "대출 등록")
    public ResponseEntity<ApiResponse<LoanResponse>> create(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid LoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(loanService.create(principal.getId(), request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "대출 수정", description = "남은 잔액(remainingBalance) 업데이트 시 사용합니다.")
    public ResponseEntity<ApiResponse<LoanResponse>> update(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody @Valid LoanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.update(principal.getId(), id, request)));
    }

    @PatchMapping("/{id}/toggle-include")
    @Operation(summary = "총자산 포함 여부 토글",
               description = "대출을 총자산 계산에 포함할지(부채로 차감) 여부를 전환합니다.")
    public ResponseEntity<ApiResponse<LoanResponse>> toggleIncludeInAssets(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.toggleIncludeInAssets(principal.getId(), id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "대출 삭제")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        loanService.delete(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
