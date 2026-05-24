package com.yooncount.book.global.crypto;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * AES-GCM 양방향 암호화 컬럼 컨버터.
 * Hibernate가 기본 생성자로 직접 인스턴스화할 수도 있어, Spring 주입은 static holder로 우회한다.
 */
@Component
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static AesGcmCryptoService cryptoService;

    @Autowired
    public void init(AesGcmCryptoService service) {
        EncryptedStringConverter.cryptoService = service;
    }

    @Override
    public String convertToDatabaseColumn(String plain) {
        if (plain == null) return null;
        return service().encrypt(plain);
    }

    @Override
    public String convertToEntityAttribute(String cipher) {
        if (cipher == null) return null;
        return service().decrypt(cipher);
    }

    private static AesGcmCryptoService service() {
        if (cryptoService == null) {
            throw new IllegalStateException("AesGcmCryptoService not initialized yet — Spring context must be up");
        }
        return cryptoService;
    }
}
