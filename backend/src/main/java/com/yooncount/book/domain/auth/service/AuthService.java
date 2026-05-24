package com.yooncount.book.domain.auth.service;

import com.yooncount.book.domain.auth.dto.AuthResponse;
import com.yooncount.book.domain.auth.dto.LoginRequest;
import com.yooncount.book.domain.auth.dto.PasswordChangeRequest;
import com.yooncount.book.domain.auth.dto.PasswordResetRequest;
import com.yooncount.book.domain.auth.dto.SecurityQuestionResponse;
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

    /** 비밀번호 초기화 시 강제로 설정되는 임시 비밀번호. 로그인 후 즉시 변경 안내. */
    public static final String RESET_PASSWORD = "0000";

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
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        User user = new User(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.name(),
                UserRole.USER,
                request.securityQuestion(),
                passwordEncoder.encode(request.securityAnswer())
        );
        User saved = userRepository.save(user);
        defaultCategorySeeder.seedFor(saved);
        String token = tokenProvider.generateToken(saved.getId(), saved.getEmail());
        return new AuthResponse(token, UserResponse.from(saved));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.email())
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
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        user.updatePassword(passwordEncoder.encode(request.newPassword()));
    }

    public SecurityQuestionResponse lookupSecurityQuestion(String email) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.getSecurityQuestion() == null || user.getSecurityQuestion().isBlank()) {
            throw new BusinessException(ErrorCode.SECURITY_QUESTION_NOT_SET);
        }
        return new SecurityQuestionResponse(user.getSecurityQuestion());
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.getSecurityAnswer() == null) {
            throw new BusinessException(ErrorCode.SECURITY_QUESTION_NOT_SET);
        }
        if (!passwordEncoder.matches(request.securityAnswer(), user.getSecurityAnswer())) {
            throw new BusinessException(ErrorCode.INVALID_SECURITY_ANSWER);
        }
        user.updatePassword(passwordEncoder.encode(RESET_PASSWORD));
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.softDelete();
    }
}
