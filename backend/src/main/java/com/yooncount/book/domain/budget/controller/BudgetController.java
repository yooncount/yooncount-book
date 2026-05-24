package com.yooncount.book.domain.budget.controller;

import com.yooncount.book.domain.budget.dto.BudgetRequest;
import com.yooncount.book.domain.budget.dto.BudgetResponse;
import com.yooncount.book.domain.budget.service.BudgetService;
import com.yooncount.book.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@Tag(name = "Budget", description = "예산 관리 API")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    @Operation(summary = "월별 예산 조회", description = "해당 월의 예산 목록과 실사용 금액, 달성률을 반환합니다.")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> findByMonth(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.ok(budgetService.findByMonth(year, month)));
    }

    @PostMapping
    @Operation(summary = "예산 설정", description = "예산을 등록하거나 수정합니다. 같은 카테고리/연월이면 금액을 덮어씁니다.")
    public ResponseEntity<ApiResponse<BudgetResponse>> save(
            @RequestBody @Valid BudgetRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(budgetService.save(request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "예산 삭제")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        budgetService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
