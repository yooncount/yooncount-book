package com.yooncount.book.domain.category.dto;

import com.yooncount.book.global.common.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryCreateRequest(
        @NotBlank(message = "카테고리 이름을 입력해주세요.")
        @Size(max = 50, message = "카테고리 이름은 50자 이하여야 합니다.")
        String name,

        @NotNull(message = "카테고리 타입을 선택해주세요.")
        TransactionType type
) {}
