package com.yooncount.book.domain.networth.controller;

import com.yooncount.book.domain.networth.dto.NetWorthSnapshotRequest;
import com.yooncount.book.domain.networth.dto.NetWorthSnapshotResponse;
import com.yooncount.book.domain.networth.service.NetWorthSnapshotService;
import com.yooncount.book.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/net-worth")
@Tag(name = "NetWorth", description = "순자산 스냅샷 API")
public class NetWorthSnapshotController {

    private final NetWorthSnapshotService snapshotService;

    public NetWorthSnapshotController(NetWorthSnapshotService snapshotService) {
        this.snapshotService = snapshotService;
    }

    @GetMapping("/snapshots")
    @Operation(summary = "순자산 스냅샷 목록 조회", description = "날짜 내림차순으로 반환합니다.")
    public ResponseEntity<ApiResponse<List<NetWorthSnapshotResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.getAll()));
    }

    @PostMapping("/snapshots")
    @Operation(summary = "현재 순자산 스냅샷 저장",
               description = "현재 자산 요약을 기반으로 스냅샷을 생성합니다. snapshotDate 미입력 시 오늘 날짜.")
    public ResponseEntity<ApiResponse<NetWorthSnapshotResponse>> capture(
            @RequestBody(required = false) NetWorthSnapshotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(snapshotService.capture(request)));
    }

    @DeleteMapping("/snapshots/{id}")
    @Operation(summary = "스냅샷 삭제")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        snapshotService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
