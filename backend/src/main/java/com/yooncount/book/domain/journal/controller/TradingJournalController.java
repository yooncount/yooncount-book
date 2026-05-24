package com.yooncount.book.domain.journal.controller;

import com.yooncount.book.domain.investment.entity.TradeType;
import com.yooncount.book.domain.journal.dto.TradingJournalRequest;
import com.yooncount.book.domain.journal.dto.TradingJournalResponse;
import com.yooncount.book.domain.journal.service.TradingJournalService;
import com.yooncount.book.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/journals")
@Tag(name = "TradingJournal", description = "매매 일지 API")
public class TradingJournalController {

    private final TradingJournalService journalService;

    public TradingJournalController(TradingJournalService journalService) {
        this.journalService = journalService;
    }

    @GetMapping
    @Operation(summary = "매매 일지 목록 조회",
               description = "ticker, tradeType, 날짜 범위로 필터링할 수 있습니다.")
    public ResponseEntity<ApiResponse<List<TradingJournalResponse>>> getJournals(
            @RequestParam(required = false) String ticker,
            @RequestParam(required = false) TradeType tradeType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok(journalService.getJournals(ticker, tradeType, startDate, endDate)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "매매 일지 단건 조회")
    public ResponseEntity<ApiResponse<TradingJournalResponse>> getJournal(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(journalService.getJournal(id)));
    }

    @PostMapping
    @Operation(summary = "매매 일지 작성")
    public ResponseEntity<ApiResponse<TradingJournalResponse>> create(
            @RequestBody @Valid TradingJournalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(journalService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "매매 일지 수정",
               description = "매수/매도 후 reflection(회고)을 추가하거나 내용을 수정합니다.")
    public ResponseEntity<ApiResponse<TradingJournalResponse>> update(
            @PathVariable Long id,
            @RequestBody @Valid TradingJournalRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(journalService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "매매 일지 삭제")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        journalService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
