package com.yooncount.book.global.crypto;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM 인증 암호화.
 * 저장 형식: base64( IV(12B) || ciphertext || authTag(16B) )
 *
 * 키 분실 시 복호화 영구 불가. 키는 APP_ENCRYPTION_KEY env로만 주입.
 */
@Service
public class AesGcmCryptoService {

    private static final String ALGO = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH_BITS = 128;

    private final String base64Key;
    private final SecureRandom random = new SecureRandom();
    private SecretKey key;

    public AesGcmCryptoService(@Value("${app.crypto.key}") String base64Key) {
        this.base64Key = base64Key;
    }

    @PostConstruct
    void init() {
        if (base64Key == null || base64Key.isBlank()) {
            throw new IllegalStateException("app.crypto.key (env APP_ENCRYPTION_KEY) is required");
        }
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(base64Key);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("APP_ENCRYPTION_KEY must be valid base64", e);
        }
        if (keyBytes.length != 32) {
            throw new IllegalStateException(
                    "APP_ENCRYPTION_KEY must decode to 32 bytes (256-bit). Generated with: openssl rand -base64 32");
        }
        this.key = new SecretKeySpec(keyBytes, ALGO);
    }

    public String encrypt(String plain) {
        if (plain == null) return null;
        try {
            byte[] iv = new byte[IV_LENGTH];
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] ciphertext = cipher.doFinal(plain.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            ByteBuffer buffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            buffer.put(iv);
            buffer.put(ciphertext);
            return Base64.getEncoder().encodeToString(buffer.array());
        } catch (Exception e) {
            throw new IllegalStateException("Encryption failed", e);
        }
    }

    public String decrypt(String encoded) {
        if (encoded == null) return null;
        try {
            byte[] data = Base64.getDecoder().decode(encoded);
            if (data.length < IV_LENGTH + 16) {
                throw new IllegalStateException("Encrypted payload too short");
            }
            ByteBuffer buffer = ByteBuffer.wrap(data);
            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] plain = cipher.doFinal(ciphertext);
            return new String(plain, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Decryption failed — key mismatch or tampered data", e);
        }
    }
}
