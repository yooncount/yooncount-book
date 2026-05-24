package com.yooncount.book.global.github;

import com.yooncount.book.global.common.ApiResponse;
import com.yooncount.book.global.github.dto.ErrorReportRequest;
import com.yooncount.book.global.github.dto.ErrorReportResponse;
import com.yooncount.book.global.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/report")
@Tag(name = "Error Report", description = "오류 신고 API")
public class ErrorReportController {

    private final GitHubIssueService gitHubIssueService;

    public ErrorReportController(GitHubIssueService gitHubIssueService) {
        this.gitHubIssueService = gitHubIssueService;
    }

    @PostMapping
    @Operation(summary = "오류 신고", description = "사용자가 입력한 오류 정보를 GitHub 이슈로 등록합니다.")
    public ResponseEntity<ApiResponse<ErrorReportResponse>> report(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid ErrorReportRequest request) {
        ErrorReportResponse response = gitHubIssueService.createIssue(request, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }
}
