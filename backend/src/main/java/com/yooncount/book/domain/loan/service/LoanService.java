package com.yooncount.book.domain.loan.service;

import com.yooncount.book.domain.loan.dto.LoanRequest;
import com.yooncount.book.domain.loan.dto.LoanResponse;
import com.yooncount.book.domain.loan.entity.Loan;
import com.yooncount.book.domain.loan.repository.LoanRepository;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class LoanService {

    private final LoanRepository loanRepository;

    public LoanService(LoanRepository loanRepository) {
        this.loanRepository = loanRepository;
    }

    public List<LoanResponse> getLoans() {
        return loanRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(LoanResponse::from)
                .toList();
    }

    public LoanResponse getLoan(Long id) {
        return LoanResponse.from(findById(id));
    }

    @Transactional
    public LoanResponse create(LoanRequest request) {
        Loan loan = new Loan(
                request.name(), request.lender(),
                request.principal(), request.remainingBalance(),
                request.interestRate(), request.startDate(), request.endDate(),
                request.includeInAssets(), request.memo()
        );
        return LoanResponse.from(loanRepository.save(loan));
    }

    @Transactional
    public LoanResponse update(Long id, LoanRequest request) {
        Loan loan = findById(id);
        loan.update(
                request.name(), request.lender(),
                request.principal(), request.remainingBalance(),
                request.interestRate(), request.startDate(), request.endDate(),
                request.includeInAssets(), request.memo()
        );
        return LoanResponse.from(loan);
    }

    @Transactional
    public LoanResponse toggleIncludeInAssets(Long id) {
        Loan loan = findById(id);
        loan.toggleIncludeInAssets();
        return LoanResponse.from(loan);
    }

    @Transactional
    public void delete(Long id) {
        if (!loanRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.LOAN_NOT_FOUND);
        }
        loanRepository.deleteById(id);
    }

    private Loan findById(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.LOAN_NOT_FOUND));
    }
}
