package com.yooncount.book.domain.auth.dto;

public record AuthResponse(
        String token,
        UserResponse user
) {}
