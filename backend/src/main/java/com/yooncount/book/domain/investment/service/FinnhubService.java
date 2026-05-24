package com.yooncount.book.domain.investment.service;

import com.yooncount.book.domain.investment.dto.StockQuoteResponse;
import com.yooncount.book.global.config.FinnhubProperties;
import com.yooncount.book.global.exception.BusinessException;
import com.yooncount.book.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class FinnhubService {

    private static final String BASE_URL = "https://finnhub.io/api/v1";

    private final FinnhubProperties properties;
    private final RestClient restClient;

    public FinnhubService(FinnhubProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .build();
    }

    public StockQuoteResponse getQuote(String ticker, String stockName) {
        if (!properties.isConfigured()) {
            throw new BusinessException(ErrorCode.FINNHUB_API_KEY_NOT_CONFIGURED);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> body = restClient.get()
                .uri("/quote?symbol={ticker}&token={key}", ticker.toUpperCase(), properties.getApiKey())
                .retrieve()
                .body(Map.class);

        if (body == null || !body.containsKey("c")) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        return new StockQuoteResponse(
                ticker.toUpperCase(),
                stockName,
                toBigDecimal(body.get("c")),  // current price
                toBigDecimal(body.get("d")),  // change
                toBigDecimal(body.get("dp")), // change percent
                toBigDecimal(body.get("h")),  // high
                toBigDecimal(body.get("l")),  // low
                toBigDecimal(body.get("o")),  // open
                toBigDecimal(body.get("pc"))  // previous close
        );
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        return new BigDecimal(value.toString());
    }
}
