package com.yooncount.book.domain.category.service;

import com.yooncount.book.domain.category.dto.CategoryCreateRequest;
import com.yooncount.book.domain.category.dto.CategoryResponse;
import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.domain.category.repository.CategoryRepository;
import com.yooncount.book.global.common.TransactionType;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> findAll(TransactionType type) {
        List<Category> categories = type != null
                ? categoryRepository.findByType(type)
                : categoryRepository.findAll();
        return categories.stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryCreateRequest request) {
        if (categoryRepository.existsByName(request.name())) {
            throw new BusinessException(ErrorCode.CATEGORY_ALREADY_EXISTS);
        }
        Category category = new Category(request.name(), request.type(), false);
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        if (category.isDefault()) {
            throw new BusinessException(ErrorCode.CANNOT_DELETE_DEFAULT_CATEGORY);
        }
        categoryRepository.delete(category);
    }
}
