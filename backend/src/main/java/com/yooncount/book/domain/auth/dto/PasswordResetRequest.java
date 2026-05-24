package com.yooncount.book.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequest(
        @NotBlank(message = "아이디를 입력해주세요.")
        String email,

        @NotBlank(message = "보안 답변을 입력해주세요.")
        String securityAnswer
) {}
