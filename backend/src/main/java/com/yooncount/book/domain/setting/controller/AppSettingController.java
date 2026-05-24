package com.yooncount.book.domain.setting.controller;

import com.yooncount.book.domain.setting.service.AppSettingService;
import com.yooncount.book.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Settings", description = "앱 설정 API")
public class AppSettingController {

    private final AppSettingService service;

    public AppSettingController(AppSettingService service) {
        this.service = service;
    }

    @GetMapping("/finnhub-api-key")
    @Operation(summary = "Finnhub API 키 조회", description = "등록된 Finnhub API 키가 있는지 확인합니다. 키 값은 마스킹하여 반환합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFinnhubApiKey() {
        boolean configured = service.get(AppSettingService.KEY_FINNHUB_API_KEY).isPresent();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("configured", configured)));
    }

    @PutMapping("/finnhub-api-key")
    @Operation(summary = "Finnhub API 키 등록/수정", description = "Finnhub API 키를 DB에 저장합니다.")
    public ResponseEntity<ApiResponse<Void>> setFinnhubApiKey(@RequestBody Map<String, String> body) {
        String key = body.get("apiKey");
        if (key == null || key.isBlank()) {
            service.delete(AppSettingService.KEY_FINNHUB_API_KEY);
        } else {
            service.set(AppSettingService.KEY_FINNHUB_API_KEY, key.trim());
        }
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @DeleteMapping("/finnhub-api-key")
    @Operation(summary = "Finnhub API 키 삭제")
    public ResponseEntity<ApiResponse<Void>> deleteFinnhubApiKey() {
        service.delete(AppSettingService.KEY_FINNHUB_API_KEY);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
