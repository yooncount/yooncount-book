package com.yooncount.book.global.github.dto;

import jakarta.validation.constraints.NotBlank;

public record ErrorReportRequest(
        @NotBlank String description,
        @NotBlank String steps,
        @NotBlank String expected,
        @NotBlank String actual,
        @NotBlank String severity,
        @NotBlank String environment,
        String logs,
        String additionalInfo
) {}
