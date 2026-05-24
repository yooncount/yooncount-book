package com.yooncount.book.domain.networth.dto;

import java.time.LocalDate;

public record NetWorthSnapshotRequest(
        LocalDate snapshotDate,
        String memo
) {}
