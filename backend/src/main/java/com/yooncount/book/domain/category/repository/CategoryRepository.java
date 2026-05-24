package com.yooncount.book.domain.category.repository;

import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.global.common.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByIdAndOwnerId(Long id, Long ownerId);

    List<Category> findAllByOwnerId(Long ownerId);

    List<Category> findByTypeAndOwnerId(TransactionType type, Long ownerId);

    boolean existsByNameAndOwnerId(String name, Long ownerId);
}
