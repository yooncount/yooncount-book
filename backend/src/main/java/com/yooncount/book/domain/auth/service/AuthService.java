package com.yooncount.book.domain.auth.service;

import com.yooncount.book.domain.auth.dto.AuthResponse;
import com.yooncount.book.domain.auth.dto.LoginRequest;
import com.yooncount.book.domain.auth.dto.SignupRequest;
import com.yooncount.book.domain.auth.dto.UserResponse;
import com.yooncount.book.domain.category.service.DefaultCategorySeeder;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.entity.UserRole;
import com.yooncount.book.domain.user.repository.UserRepository;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import com.yooncount.book.global.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final DefaultCategorySeeder defaultCategorySeeder;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       DefaultCategorySeeder defaultCategorySeeder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.defaultCategorySeeder = defaultCategorySeeder;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        User user = new User(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.name(),
                UserRole.USER
        );
        User saved = userRepository.save(user);
        defaultCategorySeeder.seedFor(saved);
        String token = tokenProvider.generateToken(saved.getId(), saved.getEmail());
        return new AuthResponse(token, UserResponse.from(saved));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        user.touchLoginAt();
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, UserResponse.from(user));
    }

    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(Long userId, com.yooncount.book.domain.auth.dto.PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        user.updatePassword(passwordEncoder.encode(request.newPassword()));
    }
}
