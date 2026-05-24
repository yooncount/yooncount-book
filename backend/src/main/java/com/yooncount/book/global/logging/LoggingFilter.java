package com.yooncount.book.global.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Order(1)
public class LoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("API");
    private static final int MAX_BODY_LEN = 500;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain chain) throws ServletException, IOException {
        ContentCachingRequestWrapper req = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper res = new ContentCachingResponseWrapper(response);

        long start = System.currentTimeMillis();
        chain.doFilter(req, res);
        long duration = System.currentTimeMillis() - start;

        printLog(req, res, duration);
        res.copyBodyToResponse();
    }

    private void printLog(ContentCachingRequestWrapper req,
                          ContentCachingResponseWrapper res,
                          long duration) {
        int status = res.getStatus();
        String reqBody = extract(req.getContentAsByteArray());
        String resBody = extract(res.getContentAsByteArray());
        String uri = req.getQueryString() != null
                ? req.getRequestURI() + "?" + req.getQueryString()
                : req.getRequestURI();

        String msg = """

                ┌──────────────────────────────────────────────────────────
                │  ▶  %s  %s
                │  IP      %s
                │  Body    %s
                ├──────────────────────────────────────────────────────────
                │  ◀  %d %s  ·  %dms
                │  Body    %s
                └──────────────────────────────────────────────────────────"""
                .formatted(
                        req.getMethod(), uri,
                        clientIp(req),
                        reqBody.isEmpty() ? "-" : reqBody,
                        status, statusText(status), duration,
                        resBody.isEmpty() ? "-" : resBody
                );

        if (status >= 500) log.error(msg);
        else if (status >= 400) log.warn(msg);
        else log.info(msg);
    }

    private String extract(byte[] bytes) {
        if (bytes == null || bytes.length == 0) return "";
        String body = new String(bytes, StandardCharsets.UTF_8).strip();
        return body.length() > MAX_BODY_LEN ? body.substring(0, MAX_BODY_LEN) + " ···" : body;
    }

    private String clientIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        return forwarded != null ? forwarded.split(",")[0].trim() : req.getRemoteAddr();
    }

    private String statusText(int status) {
        return switch (status) {
            case 200 -> "OK";
            case 201 -> "CREATED";
            case 204 -> "NO CONTENT";
            case 400 -> "BAD REQUEST";
            case 401 -> "UNAUTHORIZED";
            case 403 -> "FORBIDDEN";
            case 404 -> "NOT FOUND";
            case 409 -> "CONFLICT";
            case 500 -> "INTERNAL SERVER ERROR";
            default  -> "";
        };
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/swagger-ui")
                || uri.startsWith("/api-docs")
                || uri.startsWith("/webjars")
                || uri.equals("/favicon.ico");
    }
}
