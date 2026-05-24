package com.yooncount.book.domain.asset.controller;

import com.yooncount.book.domain.asset.dto.AssetSummaryResponse;
import com.yooncount.book.domain.asset.service.AssetService;
import com.yooncount.book.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assets")
@Tag(name = "Asset", description = "총자산 조회 API")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping("/summary")
    @Operation(summary = "총자산 조회",
               description = "현금 잔액(누적 수입 - 지출) + 주식 투자금 + 실현 손익 - 대출 잔액(포함 설정된 항목)으로 순자산을 계산합니다.")
    public ResponseEntity<ApiResponse<AssetSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(assetService.getSummary()));
    }
}
