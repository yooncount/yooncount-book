package com.yooncount.book.domain.savings.service;

import com.yooncount.book.domain.savings.dto.DepositRequest;
import com.yooncount.book.domain.savings.dto.SavingsGoalRequest;
import com.yooncount.book.domain.savings.dto.SavingsGoalResponse;
import com.yooncount.book.domain.savings.entity.SavingsGoal;
import com.yooncount.book.domain.savings.repository.SavingsGoalRepository;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;

    public SavingsGoalService(SavingsGoalRepository savingsGoalRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
    }

    public List<SavingsGoalResponse> getAll() {
        return savingsGoalRepository.findAllByOrderByIsCompletedAscTargetDateAsc()
                .stream()
                .map(SavingsGoalResponse::from)
                .toList();
    }

    public SavingsGoalResponse get(Long id) {
        return SavingsGoalResponse.from(findById(id));
    }

    @Transactional
    public SavingsGoalResponse create(SavingsGoalRequest request) {
        SavingsGoal goal = new SavingsGoal(
                request.name(), request.targetAmount(),
                request.savedAmount(), request.targetDate(), request.memo()
        );
        return SavingsGoalResponse.from(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse update(Long id, SavingsGoalRequest request) {
        SavingsGoal goal = findById(id);
        goal.update(request.name(), request.targetAmount(), request.targetDate(), request.memo());
        return SavingsGoalResponse.from(goal);
    }

    @Transactional
    public SavingsGoalResponse deposit(Long id, DepositRequest request) {
        SavingsGoal goal = findById(id);
        goal.deposit(request.amount());
        return SavingsGoalResponse.from(goal);
    }

    @Transactional
    public SavingsGoalResponse toggleComplete(Long id) {
        SavingsGoal goal = findById(id);
        if (goal.isCompleted()) goal.reopen();
        else goal.complete();
        return SavingsGoalResponse.from(goal);
    }

    @Transactional
    public void delete(Long id) {
        if (!savingsGoalRepository.existsById(id))
            throw new BusinessException(ErrorCode.SAVINGS_GOAL_NOT_FOUND);
        savingsGoalRepository.deleteById(id);
    }

    private SavingsGoal findById(Long id) {
        return savingsGoalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SAVINGS_GOAL_NOT_FOUND));
    }
}
