package com.yooncount.book.domain.statistics.controller;

import com.yooncount.book.domain.statistics.dto.AnnualStatisticsResponse;
import com.yooncount.book.domain.statistics.dto.CategoryTrendResponse;
import com.yooncount.book.domain.statistics.dto.MonthlyStatisticsResponse;
import com.yooncount.book.domain.statistics.service.StatisticsService;
import com.yooncount.book.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
@Tag(name = "Statistics", description = "통계 API")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/monthly")
    @Operation(summary = "월별 통계 조회", description = "수입/지출 합계 및 카테고리별 비율을 반환합니다.")
    public ResponseEntity<ApiResponse<MonthlyStatisticsResponse>> getMonthly(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.ok(
                statisticsService.getMonthlyStatistics(year, month)));
    }

    @GetMapping("/annual")
    @Operation(summary = "연간 통계 조회", description = "연도별 월별 수입/지출 집계를 반환합니다.")
    public ResponseEntity<ApiResponse<AnnualStatisticsResponse>> getAnnual(
            @RequestParam(required = false) Integer year) {
        int y = (year != null) ? year : java.time.LocalDate.now().getYear();
        return ResponseEntity.ok(ApiResponse.ok(statisticsService.getAnnualStatistics(y)));
    }

    @GetMapping("/trend")
    @Operation(summary = "카테고리별 월별 추이",
               description = "특정 카테고리의 최근 N개월 지출 추이를 반환합니다.")
    public ResponseEntity<ApiResponse<CategoryTrendResponse>> getTrend(
            @RequestParam Long categoryId,
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(ApiResponse.ok(
                statisticsService.getCategoryTrend(categoryId, months)));
    }
}
