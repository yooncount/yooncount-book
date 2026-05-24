package com.yooncount.book.domain.savings.repository;

import com.yooncount.book.domain.savings.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {

    List<SavingsGoal> findAllByOrderByIsCompletedAscTargetDateAsc();
}
