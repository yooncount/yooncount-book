package com.yooncount.book.domain.budget.repository;

import com.yooncount.book.domain.budget.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByIdAndOwnerId(Long id, Long ownerId);

    @Query("SELECT b FROM Budget b JOIN FETCH b.category " +
           "WHERE b.owner.id = :ownerId AND b.year = :year AND b.month = :month")
    List<Budget> findByYearAndMonth(@Param("ownerId") Long ownerId,
                                    @Param("year") int year,
                                    @Param("month") int month);

    Optional<Budget> findByOwnerIdAndCategoryIdAndYearAndMonth(Long ownerId, Long categoryId, int year, int month);
}
