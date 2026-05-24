package com.yooncount.book.domain.admin.controller;

import com.yooncount.book.domain.admin.dto.AdminStatsResponse;
import com.yooncount.book.domain.admin.dto.AdminUserSummary;
import com.yooncount.book.domain.admin.dto.ErrorLogResponse;
import com.yooncount.book.domain.admin.service.AdminService;
import com.yooncount.book.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "관리자 전용 API (ROLE_ADMIN)")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    @Operation(summary = "회원 목록")
    public ResponseEntity<ApiResponse<List<AdminUserSummary>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllUsers()));
    }

    @GetMapping("/error-logs")
    @Operation(summary = "에러 로그 (페이지 단위, 최신순)")
    public ResponseEntity<ApiResponse<Page<ErrorLogResponse>>> getErrorLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getErrorLogs(page, size)));
    }

    @GetMapping("/stats")
    @Operation(summary = "시스템 통계 대시보드")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getStats()));
    }
}
