package com.yooncount.book.domain.budget.repository;

import com.yooncount.book.domain.budget.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    @Query("SELECT b FROM Budget b JOIN FETCH b.category WHERE b.year = :year AND b.month = :month")
    List<Budget> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    Optional<Budget> findByCategoryIdAndYearAndMonth(Long categoryId, int year, int month);
}
