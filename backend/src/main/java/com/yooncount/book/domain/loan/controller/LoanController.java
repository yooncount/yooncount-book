package com.yooncount.book.domain.loan.controller;

import com.yooncount.book.domain.loan.dto.LoanRequest;
import com.yooncount.book.domain.loan.dto.LoanResponse;
import com.yooncount.book.domain.loan.service.LoanService;
import com.yooncount.book.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<ApiResponse<List<LoanResponse>>> getLoans() {
        return ResponseEntity.ok(ApiResponse.ok(loanService.getLoans()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "대출 단건 조회")
    public ResponseEntity<ApiResponse<LoanResponse>> getLoan(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.getLoan(id)));
    }

    @PostMapping
    @Operation(summary = "대출 등록")
    public ResponseEntity<ApiResponse<LoanResponse>> create(
            @RequestBody @Valid LoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(loanService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "대출 수정", description = "남은 잔액(remainingBalance) 업데이트 시 사용합니다.")
    public ResponseEntity<ApiResponse<LoanResponse>> update(
            @PathVariable Long id,
            @RequestBody @Valid LoanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.update(id, request)));
    }

    @PatchMapping("/{id}/toggle-include")
    @Operation(summary = "총자산 포함 여부 토글",
               description = "대출을 총자산 계산에 포함할지(부채로 차감) 여부를 전환합니다.")
    public ResponseEntity<ApiResponse<LoanResponse>> toggleIncludeInAssets(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.toggleIncludeInAssets(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "대출 삭제")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        loanService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
