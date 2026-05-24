package com.yooncount.book.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "아이디를 입력해주세요.")
        @Size(max = 255, message = "아이디는 255자 이하여야 합니다.")
        String email,

        @NotBlank(message = "비밀번호를 입력해주세요.")
        @Size(min = 8, max = 64, message = "비밀번호는 8자 이상 64자 이하여야 합니다.")
        String password,

        @NotBlank(message = "이름을 입력해주세요.")
        @Size(max = 100, message = "이름은 100자 이하여야 합니다.")
        String name,

        @NotBlank(message = "보안 질문을 입력해주세요.")
        @Size(max = 255, message = "보안 질문은 255자 이하여야 합니다.")
        String securityQuestion,

        @NotBlank(message = "보안 답변을 입력해주세요.")
        @Size(max = 255, message = "보안 답변은 255자 이하여야 합니다.")
        String securityAnswer
) {}
