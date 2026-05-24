package com.yooncount.book.domain.journal.service;

import com.yooncount.book.domain.investment.entity.TradeType;
import com.yooncount.book.domain.journal.dto.TradingJournalRequest;
import com.yooncount.book.domain.journal.dto.TradingJournalResponse;
import com.yooncount.book.domain.journal.entity.TradingJournal;
import com.yooncount.book.domain.journal.repository.TradingJournalRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class TradingJournalService {

    private final TradingJournalRepository journalRepository;
    private final UserRepository userRepository;

    public TradingJournalService(TradingJournalRepository journalRepository,
                                  UserRepository userRepository) {
        this.journalRepository = journalRepository;
        this.userRepository = userRepository;
    }

    public List<TradingJournalResponse> getJournals(Long ownerId, String ticker, TradeType tradeType,
                                                     LocalDate startDate, LocalDate endDate) {
        String upperTicker = (ticker != null) ? ticker.toUpperCase() : null;
        return journalRepository.findByFilter(ownerId, upperTicker, tradeType, startDate, endDate)
                .stream()
                .map(TradingJournalResponse::from)
                .toList();
    }

    public TradingJournalResponse getJournal(Long ownerId, Long id) {
        return TradingJournalResponse.from(findByIdAndOwnerId(ownerId, id));
    }

    @Transactional
    public TradingJournalResponse create(Long ownerId, TradingJournalRequest request) {
        User owner = userRepository.getReferenceById(ownerId);
        TradingJournal journal = new TradingJournal(
                owner, request.ticker(), request.stockName(), request.tradeType(),
                request.tradeDate(), request.quantity(), request.price(),
                request.reason(), request.strategy(), request.reflection()
        );
        return TradingJournalResponse.from(journalRepository.save(journal));
    }

    @Transactional
    public TradingJournalResponse update(Long ownerId, Long id, TradingJournalRequest request) {
        TradingJournal journal = findByIdAndOwnerId(ownerId, id);
        journal.update(request.tradeDate(), request.quantity(), request.price(),
                       request.reason(), request.strategy(), request.reflection());
        return TradingJournalResponse.from(journal);
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        TradingJournal journal = findByIdAndOwnerId(ownerId, id);
        journalRepository.delete(journal);
    }

    private TradingJournal findByIdAndOwnerId(Long ownerId, Long id) {
        return journalRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TRADING_JOURNAL_NOT_FOUND));
    }
}
