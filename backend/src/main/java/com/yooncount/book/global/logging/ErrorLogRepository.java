package com.yooncount.book.global.logging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {
    Page<ErrorLog> findAllByOrderByOccurredAtDesc(Pageable pageable);

    long countByOccurredAtAfter(LocalDateTime since);
}
