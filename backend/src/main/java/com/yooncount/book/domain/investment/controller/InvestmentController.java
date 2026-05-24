package com.yooncount.book.domain.investment.controller;

import com.yooncount.book.domain.investment.dto.PortfolioResponse;
import com.yooncount.book.domain.investment.dto.StockQuoteResponse;
import com.yooncount.book.domain.investment.dto.StockTransactionRequest;
import com.yooncount.book.domain.investment.dto.StockTransactionResponse;
import com.yooncount.book.domain.investment.service.FinnhubService;
import com.yooncount.book.domain.investment.service.InvestmentService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/investments")
@Tag(name = "Investment", description = "증권 투자 관리 API")
public class InvestmentController {

    private final InvestmentService investmentService;
    private final FinnhubService finnhubService;

    public InvestmentController(InvestmentService investmentService, FinnhubService finnhubService) {
        this.investmentService = investmentService;
        this.finnhubService = finnhubService;
    }

    @GetMapping("/transactions")
    @Operation(summary = "거래 내역 조회", description = "ticker 파라미터로 특정 종목 필터링 가능")
    public ResponseEntity<ApiResponse<List<StockTransactionResponse>>> findTransactions(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) String ticker) {
        return ResponseEntity.ok(ApiResponse.ok(investmentService.findTransactions(principal.getId(), ticker)));
    }

    @PostMapping("/transactions")
    @Operation(summary = "거래 등록", description = "매수(BUY) 또는 매도(SELL) 거래를 등록합니다.")
    public ResponseEntity<ApiResponse<StockTransactionResponse>> create(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid StockTransactionRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(investmentService.create(principal.getId(), request)));
    }

    @DeleteMapping("/transactions/{id}")
    @Operation(summary = "거래 삭제")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        investmentService.delete(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @GetMapping("/quote")
    @Operation(summary = "주식 현재가 조회 (Finnhub)",
               description = "Finnhub API로 실시간 주가를 조회합니다. " +
                             "한국 주식은 티커 뒤에 .KS 를 붙이세요 (예: 005930.KS). " +
                             "Finnhub API 키가 설정되지 않은 경우 503과 함께 등록 안내를 반환합니다.")
    public ResponseEntity<ApiResponse<StockQuoteResponse>> getQuote(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam String ticker,
            @RequestParam(defaultValue = "") String stockName) {
        return ResponseEntity.ok(ApiResponse.ok(finnhubService.getQuote(principal.getId(), ticker, stockName)));
    }

    @GetMapping("/portfolio")
    @Operation(summary = "포트폴리오 조회",
               description = "종목별 보유 수량, 평균 매수 단가, 실현 손익, 수익률을 반환합니다. 전량 매도했더라도 손익이 있으면 포함됩니다.")
    public ResponseEntity<ApiResponse<List<PortfolioResponse>>> getPortfolio(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(investmentService.getPortfolio(principal.getId())));
    }
}
