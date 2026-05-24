package com.yooncount.book.domain.networth.service;

import com.yooncount.book.domain.asset.service.AssetService;
import com.yooncount.book.domain.asset.dto.AssetSummaryResponse;
import com.yooncount.book.domain.networth.dto.NetWorthSnapshotRequest;
import com.yooncount.book.domain.networth.dto.NetWorthSnapshotResponse;
import com.yooncount.book.domain.networth.entity.NetWorthSnapshot;
import com.yooncount.book.domain.networth.repository.NetWorthSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class NetWorthSnapshotService {

    private final NetWorthSnapshotRepository snapshotRepository;
    private final AssetService assetService;

    public NetWorthSnapshotService(NetWorthSnapshotRepository snapshotRepository,
                                   AssetService assetService) {
        this.snapshotRepository = snapshotRepository;
        this.assetService = assetService;
    }

    public List<NetWorthSnapshotResponse> getAll() {
        return snapshotRepository.findAllByOrderBySnapshotDateDesc()
                .stream()
                .map(NetWorthSnapshotResponse::from)
                .toList();
    }

    @Transactional
    public NetWorthSnapshotResponse capture(NetWorthSnapshotRequest request) {
        AssetSummaryResponse summary = assetService.getSummary();
        LocalDate date = (request != null && request.snapshotDate() != null)
                ? request.snapshotDate()
                : LocalDate.now();
        String memo = (request != null) ? request.memo() : null;

        NetWorthSnapshot snapshot = new NetWorthSnapshot(
                date,
                summary.cashBalance(),
                summary.stockInvestment(),
                summary.realizedStockPnl(),
                summary.grossAssets(),
                summary.totalDebt(),
                summary.netAssets(),
                memo
        );
        return NetWorthSnapshotResponse.from(snapshotRepository.save(snapshot));
    }

    @Transactional
    public void delete(Long id) {
        snapshotRepository.deleteById(id);
    }
}
