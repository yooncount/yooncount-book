package com.yooncount.book.domain.savings.service;

import com.yooncount.book.domain.savings.dto.DepositRequest;
import com.yooncount.book.domain.savings.dto.SavingsGoalRequest;
import com.yooncount.book.domain.savings.dto.SavingsGoalResponse;
import com.yooncount.book.domain.savings.entity.SavingsGoal;
import com.yooncount.book.domain.savings.repository.SavingsGoalRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final UserRepository userRepository;

    public SavingsGoalService(SavingsGoalRepository savingsGoalRepository,
                              UserRepository userRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.userRepository = userRepository;
    }

    public List<SavingsGoalResponse> getAll(Long ownerId) {
        return savingsGoalRepository.findAllByOwnerIdOrderByIsCompletedAscTargetDateAsc(ownerId)
                .stream()
                .map(SavingsGoalResponse::from)
                .toList();
    }

    public SavingsGoalResponse get(Long ownerId, Long id) {
        return SavingsGoalResponse.from(findByIdAndOwnerId(ownerId, id));
    }

    @Transactional
    public SavingsGoalResponse create(Long ownerId, SavingsGoalRequest request) {
        User owner = userRepository.getReferenceById(ownerId);
        SavingsGoal goal = new SavingsGoal(
                owner, request.name(), request.targetAmount(),
                request.savedAmount(), request.targetDate(), request.memo()
        );
        return SavingsGoalResponse.from(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse update(Long ownerId, Long id, SavingsGoalRequest request) {
        SavingsGoal goal = findByIdAndOwnerId(ownerId, id);
        goal.update(request.name(), request.targetAmount(), request.targetDate(), request.memo());
        return SavingsGoalResponse.from(goal);
    }

    @Transactional
    public SavingsGoalResponse deposit(Long ownerId, Long id, DepositRequest request) {
        SavingsGoal goal = findByIdAndOwnerId(ownerId, id);
        goal.deposit(request.amount());
        return SavingsGoalResponse.from(goal);
    }

    @Transactional
    public SavingsGoalResponse toggleComplete(Long ownerId, Long id) {
        SavingsGoal goal = findByIdAndOwnerId(ownerId, id);
        if (goal.isCompleted()) goal.reopen();
        else goal.complete();
        return SavingsGoalResponse.from(goal);
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        if (!savingsGoalRepository.existsByIdAndOwnerId(id, ownerId))
            throw new BusinessException(ErrorCode.SAVINGS_GOAL_NOT_FOUND);
        savingsGoalRepository.deleteById(id);
    }

    private SavingsGoal findByIdAndOwnerId(Long ownerId, Long id) {
        return savingsGoalRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SAVINGS_GOAL_NOT_FOUND));
    }
}
