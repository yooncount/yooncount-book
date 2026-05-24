package com.yooncount.book.domain.category.repository;

import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.global.common.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByType(TransactionType type);

    boolean existsByName(String name);
}
