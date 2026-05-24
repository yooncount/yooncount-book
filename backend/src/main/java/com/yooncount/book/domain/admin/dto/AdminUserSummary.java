package com.yooncount.book.domain.admin.dto;

import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.entity.UserRole;

import java.time.LocalDateTime;

public record AdminUserSummary(
        Long id,
        String email,
        String name,
        UserRole role,
        LocalDateTime createdAt,
        LocalDateTime lastLoginAt
) {
    public static AdminUserSummary from(User user) {
        return new AdminUserSummary(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
