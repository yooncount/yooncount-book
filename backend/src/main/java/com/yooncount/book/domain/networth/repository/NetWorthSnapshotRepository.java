package com.yooncount.book.domain.networth.repository;

import com.yooncount.book.domain.networth.entity.NetWorthSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NetWorthSnapshotRepository extends JpaRepository<NetWorthSnapshot, Long> {

    List<NetWorthSnapshot> findAllByOrderBySnapshotDateDesc();
}
