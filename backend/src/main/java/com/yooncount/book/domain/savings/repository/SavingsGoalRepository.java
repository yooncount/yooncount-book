package com.yooncount.book.domain.savings.repository;

import com.yooncount.book.domain.savings.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {

    Optional<SavingsGoal> findByIdAndOwnerId(Long id, Long ownerId);

    boolean existsByIdAndOwnerId(Long id, Long ownerId);

    List<SavingsGoal> findAllByOwnerIdOrderByIsCompletedAscTargetDateAsc(Long ownerId);
}
