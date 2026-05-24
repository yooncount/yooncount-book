package com.yooncount.book.domain.savings.controller;

import com.yooncount.book.domain.savings.dto.DepositRequest;
import com.yooncount.book.domain.savings.dto.SavingsGoalRequest;
import com.yooncount.book.domain.savings.dto.SavingsGoalResponse;
import com.yooncount.book.domain.savings.service.SavingsGoalService;
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
@RequestMapping("/api/savings-goals")
@Tag(name = "SavingsGoal", description = "저축 목표 관리 API")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    public SavingsGoalController(SavingsGoalService savingsGoalService) {
        this.savingsGoalService = savingsGoalService;
    }

    @GetMapping
    @Operation(summary = "저축 목표 목록 조회")
    public ResponseEntity<ApiResponse<List<SavingsGoalResponse>>> getAll(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(savingsGoalService.getAll(principal.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "저축 목표 단건 조회")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> get(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(savingsGoalService.get(principal.getId(), id)));
    }

    @PostMapping
    @Operation(summary = "저축 목표 등록")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> create(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid SavingsGoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(savingsGoalService.create(principal.getId(), request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "저축 목표 수정")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> update(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody @Valid SavingsGoalRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(savingsGoalService.update(principal.getId(), id, request)));
    }

    @PatchMapping("/{id}/deposit")
    @Operation(summary = "저축액 추가",
               description = "저축 금액을 적립합니다. 목표 달성 시 자동으로 완료 처리됩니다.")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> deposit(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody @Valid DepositRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(savingsGoalService.deposit(principal.getId(), id, request)));
    }

    @PatchMapping("/{id}/toggle-complete")
    @Operation(summary = "달성 여부 토글")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> toggleComplete(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(savingsGoalService.toggleComplete(principal.getId(), id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "저축 목표 삭제")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        savingsGoalService.delete(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
