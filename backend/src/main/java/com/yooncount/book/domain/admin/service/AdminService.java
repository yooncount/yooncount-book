package com.yooncount.book.domain.admin.service;

import com.yooncount.book.domain.admin.dto.AdminStatsResponse;
import com.yooncount.book.domain.admin.dto.AdminUserSummary;
import com.yooncount.book.domain.admin.dto.ErrorLogResponse;
import com.yooncount.book.domain.transaction.repository.TransactionRepository;
import com.yooncount.book.domain.user.repository.UserRepository;
import com.yooncount.book.global.logging.ErrorLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final ErrorLogRepository errorLogRepository;
    private final TransactionRepository transactionRepository;

    public AdminService(UserRepository userRepository,
                        ErrorLogRepository errorLogRepository,
                        TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.errorLogRepository = errorLogRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<AdminUserSummary> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AdminUserSummary::from)
                .toList();
    }

    public Page<ErrorLogResponse> getErrorLogs(int page, int size) {
        return errorLogRepository
                .findAllByOrderByOccurredAtDesc(PageRequest.of(page, size))
                .map(ErrorLogResponse::from);
    }

    public AdminStatsResponse getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusDays(7);
        LocalDateTime monthAgo = now.minusDays(30);

        return new AdminStatsResponse(
                userRepository.count(),
                userRepository.countByCreatedAtAfter(weekAgo),
                userRepository.countByCreatedAtAfter(monthAgo),
                userRepository.countByLastLoginAtAfter(monthAgo),
                transactionRepository.count(),
                errorLogRepository.countByOccurredAtAfter(weekAgo)
        );
    }
}
