package com.yooncount.book.domain.category.service;

import com.yooncount.book.domain.category.dto.CategoryCreateRequest;
import com.yooncount.book.domain.category.dto.CategoryResponse;
import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.domain.category.repository.CategoryRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
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
    private final UserRepository userRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<CategoryResponse> findAll(Long ownerId, TransactionType type) {
        List<Category> categories = type != null
                ? categoryRepository.findByTypeAndOwnerId(type, ownerId)
                : categoryRepository.findAllByOwnerId(ownerId);
        return categories.stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public CategoryResponse create(Long ownerId, CategoryCreateRequest request) {
        if (categoryRepository.existsByNameAndOwnerId(request.name(), ownerId)) {
            throw new BusinessException(ErrorCode.CATEGORY_ALREADY_EXISTS);
        }
        User owner = userRepository.getReferenceById(ownerId);
        Category category = new Category(owner, request.name(), request.type(), false);
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        Category category = categoryRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        if (category.isDefault()) {
            throw new BusinessException(ErrorCode.CANNOT_DELETE_DEFAULT_CATEGORY);
        }
        categoryRepository.delete(category);
    }
}
