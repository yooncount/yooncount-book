package com.yooncount.book.domain.networth.dto;

import com.yooncount.book.domain.networth.entity.NetWorthSnapshot;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record NetWorthSnapshotResponse(
        Long id,
        LocalDate snapshotDate,
        BigDecimal cashBalance,
        BigDecimal stockInvestment,
        BigDecimal realizedStockPnl,
        BigDecimal grossAssets,
        BigDecimal totalDebt,
        BigDecimal netAssets,
        String memo,
        LocalDateTime createdAt
) {
    public static NetWorthSnapshotResponse from(NetWorthSnapshot s) {
        return new NetWorthSnapshotResponse(
                s.getId(), s.getSnapshotDate(),
                s.getCashBalance(), s.getStockInvestment(), s.getRealizedStockPnl(),
                s.getGrossAssets(), s.getTotalDebt(), s.getNetAssets(),
                s.getMemo(), s.getCreatedAt()
        );
    }
}
