package com.yooncount.book.domain.category.dto;

import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.global.common.TransactionType;

public record CategoryResponse(
        Long id,
        String name,
        TransactionType type,
        boolean isDefault
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.isDefault()
        );
    }
}
