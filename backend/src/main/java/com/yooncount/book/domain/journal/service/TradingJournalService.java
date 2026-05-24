package com.yooncount.book.domain.journal.service;

import com.yooncount.book.domain.investment.entity.TradeType;
import com.yooncount.book.domain.journal.dto.TradingJournalRequest;
import com.yooncount.book.domain.journal.dto.TradingJournalResponse;
import com.yooncount.book.domain.journal.entity.TradingJournal;
import com.yooncount.book.domain.journal.repository.TradingJournalRepository;
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

    public TradingJournalService(TradingJournalRepository journalRepository) {
        this.journalRepository = journalRepository;
    }

    public List<TradingJournalResponse> getJournals(String ticker, TradeType tradeType,
                                                     LocalDate startDate, LocalDate endDate) {
        String upperTicker = (ticker != null) ? ticker.toUpperCase() : null;
        return journalRepository.findByFilter(upperTicker, tradeType, startDate, endDate)
                .stream()
                .map(TradingJournalResponse::from)
                .toList();
    }

    public TradingJournalResponse getJournal(Long id) {
        return TradingJournalResponse.from(findById(id));
    }

    @Transactional
    public TradingJournalResponse create(TradingJournalRequest request) {
        TradingJournal journal = new TradingJournal(
                request.ticker(), request.stockName(), request.tradeType(),
                request.tradeDate(), request.quantity(), request.price(),
                request.reason(), request.strategy(), request.reflection()
        );
        return TradingJournalResponse.from(journalRepository.save(journal));
    }

    @Transactional
    public TradingJournalResponse update(Long id, TradingJournalRequest request) {
        TradingJournal journal = findById(id);
        journal.update(request.tradeDate(), request.quantity(), request.price(),
                       request.reason(), request.strategy(), request.reflection());
        return TradingJournalResponse.from(journal);
    }

    @Transactional
    public void delete(Long id) {
        if (!journalRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.TRADING_JOURNAL_NOT_FOUND);
        }
        journalRepository.deleteById(id);
    }

    private TradingJournal findById(Long id) {
        return journalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TRADING_JOURNAL_NOT_FOUND));
    }
}
