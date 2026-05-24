package com.yooncount.book.domain.loan.service;

import com.yooncount.book.domain.loan.dto.LoanRequest;
import com.yooncount.book.domain.loan.dto.LoanResponse;
import com.yooncount.book.domain.loan.entity.Loan;
import com.yooncount.book.domain.loan.repository.LoanRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class LoanService {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;

    public LoanService(LoanRepository loanRepository, UserRepository userRepository) {
        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
    }

    public List<LoanResponse> getLoans(Long ownerId) {
        return loanRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(LoanResponse::from)
                .toList();
    }

    public LoanResponse getLoan(Long ownerId, Long id) {
        return LoanResponse.from(findByIdAndOwnerId(ownerId, id));
    }

    @Transactional
    public LoanResponse create(Long ownerId, LoanRequest request) {
        User owner = userRepository.getReferenceById(ownerId);
        Loan loan = new Loan(
                owner,
                request.name(), request.lender(),
                request.principal(), request.remainingBalance(),
                request.interestRate(), request.startDate(), request.endDate(),
                request.includeInAssets(), request.memo()
        );
        return LoanResponse.from(loanRepository.save(loan));
    }

    @Transactional
    public LoanResponse update(Long ownerId, Long id, LoanRequest request) {
        Loan loan = findByIdAndOwnerId(ownerId, id);
        loan.update(
                request.name(), request.lender(),
                request.principal(), request.remainingBalance(),
                request.interestRate(), request.startDate(), request.endDate(),
                request.includeInAssets(), request.memo()
        );
        return LoanResponse.from(loan);
    }

    @Transactional
    public LoanResponse toggleIncludeInAssets(Long ownerId, Long id) {
        Loan loan = findByIdAndOwnerId(ownerId, id);
        loan.toggleIncludeInAssets();
        return LoanResponse.from(loan);
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        Loan loan = findByIdAndOwnerId(ownerId, id);
        loanRepository.delete(loan);
    }

    private Loan findByIdAndOwnerId(Long ownerId, Long id) {
        return loanRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.LOAN_NOT_FOUND));
    }
}
