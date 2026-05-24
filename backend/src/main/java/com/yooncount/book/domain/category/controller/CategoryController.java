package com.yooncount.book.domain.category.controller;

import com.yooncount.book.domain.category.dto.CategoryCreateRequest;
import com.yooncount.book.domain.category.dto.CategoryResponse;
import com.yooncount.book.domain.category.service.CategoryService;
import com.yooncount.book.global.common.ApiResponse;
import com.yooncount.book.global.common.TransactionType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/categories")
@Tag(name = "Category", description = "카테고리 관리 API")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "카테고리 목록 조회", description = "type 파라미터로 INCOME/EXPENSE 필터링 가능")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> findAll(
            @RequestParam(required = false) TransactionType type) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.findAll(type)));
    }

    @PostMapping
    @Operation(summary = "카테고리 등록", description = "커스텀 카테고리를 추가합니다.")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @RequestBody @Valid CategoryCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(categoryService.create(request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "카테고리 삭제", description = "기본 카테고리는 삭제할 수 없습니다.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
