package com.yooncount.book.domain.networth.repository;

import com.yooncount.book.domain.networth.entity.NetWorthSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NetWorthSnapshotRepository extends JpaRepository<NetWorthSnapshot, Long> {

    Optional<NetWorthSnapshot> findByIdAndOwnerId(Long id, Long ownerId);

    List<NetWorthSnapshot> findAllByOwnerIdOrderBySnapshotDateDesc(Long ownerId);

    void deleteByIdAndOwnerId(Long id, Long ownerId);
}
