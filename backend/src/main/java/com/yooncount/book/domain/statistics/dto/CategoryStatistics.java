package com.yooncount.book.domain.statistics.dto;

import java.math.BigDecimal;

public record CategoryStatistics(
        Long categoryId,
        String categoryName,
        BigDecimal amount,
        double ratio
) {}
