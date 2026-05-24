package com.yooncount.book.global.github;

import com.yooncount.book.global.common.ApiResponse;
import com.yooncount.book.global.github.dto.ErrorReportRequest;
import com.yooncount.book.global.github.dto.ErrorReportResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
            @RequestBody @Valid ErrorReportRequest request) {
        ErrorReportResponse response = gitHubIssueService.createIssue(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }
}
