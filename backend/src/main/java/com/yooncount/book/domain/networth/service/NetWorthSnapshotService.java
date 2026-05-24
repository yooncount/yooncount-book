package com.yooncount.book.domain.networth.service;

import com.yooncount.book.domain.asset.service.AssetService;
import com.yooncount.book.domain.asset.dto.AssetSummaryResponse;
import com.yooncount.book.domain.networth.dto.NetWorthSnapshotRequest;
import com.yooncount.book.domain.networth.dto.NetWorthSnapshotResponse;
import com.yooncount.book.domain.networth.entity.NetWorthSnapshot;
import com.yooncount.book.domain.networth.repository.NetWorthSnapshotRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class NetWorthSnapshotService {

    private final NetWorthSnapshotRepository snapshotRepository;
    private final AssetService assetService;
    private final UserRepository userRepository;

    public NetWorthSnapshotService(NetWorthSnapshotRepository snapshotRepository,
                                   AssetService assetService,
                                   UserRepository userRepository) {
        this.snapshotRepository = snapshotRepository;
        this.assetService = assetService;
        this.userRepository = userRepository;
    }

    public List<NetWorthSnapshotResponse> getAll(Long ownerId) {
        return snapshotRepository.findAllByOwnerIdOrderBySnapshotDateDesc(ownerId)
                .stream()
                .map(NetWorthSnapshotResponse::from)
                .toList();
    }

    @Transactional
    public NetWorthSnapshotResponse capture(Long ownerId, NetWorthSnapshotRequest request) {
        User owner = userRepository.getReferenceById(ownerId);
        AssetSummaryResponse summary = assetService.getSummary(ownerId);
        LocalDate date = (request != null && request.snapshotDate() != null)
                ? request.snapshotDate()
                : LocalDate.now();
        String memo = (request != null) ? request.memo() : null;

        NetWorthSnapshot snapshot = new NetWorthSnapshot(
                owner,
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
    public void delete(Long ownerId, Long id) {
        snapshotRepository.deleteByIdAndOwnerId(id, ownerId);
    }
}
