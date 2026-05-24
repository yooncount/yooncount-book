package com.yooncount.book.domain.user.repository;

import com.yooncount.book.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmailAndDeletedAtIsNull(String email);

    List<User> findAllByOrderByCreatedAtDesc();

    long countByCreatedAtAfter(LocalDateTime since);

    long countByLastLoginAtAfter(LocalDateTime since);
}
