package com.yooncount.book.global.github;

import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import com.yooncount.book.global.github.dto.ErrorReportRequest;
import com.yooncount.book.global.github.dto.ErrorReportResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GitHubIssueService {

    private final RestClient restClient;
    private final String repoOwner;
    private final String repoName;

    public GitHubIssueService(
            @Value("${github.token}") String token,
            @Value("${github.repo-owner}") String repoOwner,
            @Value("${github.repo-name}") String repoName
    ) {
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.github.com")
                .defaultHeader("Authorization", "Bearer " + token)
                .defaultHeader("Accept", "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .build();
    }

    public ErrorReportResponse createIssue(ErrorReportRequest request) {
        String title = "[BUG] " + truncate(request.description(), 60);
        String body = buildIssueBody(request);

        Map<?, ?> response;
        try {
            response = restClient.post()
                    .uri("/repos/{owner}/{repo}/issues", repoOwner, repoName)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("title", title, "body", body, "labels", List.of("bug")))
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.GITHUB_API_ERROR);
        }

        return new ErrorReportResponse(
                (int) response.get("number"),
                (String) response.get("html_url")
        );
    }

    private String buildIssueBody(ErrorReportRequest req) {
        StringBuilder sb = new StringBuilder();
        sb.append("## 버그 설명\n").append(req.description()).append("\n\n");
        sb.append("## 재현 방법\n").append(req.steps()).append("\n\n");
        sb.append("## 예상 결과\n").append(req.expected()).append("\n\n");
        sb.append("## 실제 결과\n").append(req.actual()).append("\n\n");
        sb.append("## 심각도\n").append(req.severity()).append("\n\n");
        sb.append("## 환경 정보\n").append(req.environment()).append("\n\n");

        if (req.logs() != null && !req.logs().isBlank()) {
            sb.append("## 로그 / 스크린샷\n```\n").append(req.logs()).append("\n```\n\n");
        }
        if (req.additionalInfo() != null && !req.additionalInfo().isBlank()) {
            sb.append("## 추가 정보\n").append(req.additionalInfo()).append("\n\n");
        }

        sb.append("---\n*이 이슈는 앱 내 오류 신고 기능을 통해 자동 생성되었습니다.*");
        return sb.toString();
    }

    private String truncate(String text, int maxLength) {
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "...";
    }
}
