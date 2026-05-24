package com.yooncount.book.domain.category.service;

import com.yooncount.book.domain.category.entity.Category;
import com.yooncount.book.domain.category.repository.CategoryRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.global.common.TransactionType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DefaultCategorySeeder {

    private static final List<Default> DEFAULTS = List.of(
            new Default("식비", TransactionType.EXPENSE),
            new Default("교통", TransactionType.EXPENSE),
            new Default("주거", TransactionType.EXPENSE),
            new Default("의료", TransactionType.EXPENSE),
            new Default("여가", TransactionType.EXPENSE),
            new Default("쇼핑", TransactionType.EXPENSE),
            new Default("통신", TransactionType.EXPENSE),
            new Default("교육", TransactionType.EXPENSE),
            new Default("기타지출", TransactionType.EXPENSE),
            new Default("급여", TransactionType.INCOME),
            new Default("부수입", TransactionType.INCOME),
            new Default("투자", TransactionType.INCOME),
            new Default("기타수입", TransactionType.INCOME)
    );

    private final CategoryRepository categoryRepository;

    public DefaultCategorySeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public void seedFor(User owner) {
        List<Category> categories = DEFAULTS.stream()
                .map(d -> new Category(owner, d.name(), d.type(), true))
                .toList();
        categoryRepository.saveAll(categories);
    }

    private record Default(String name, TransactionType type) {}
}
