package com.yooncount.book.domain.setting.service;

import com.yooncount.book.domain.setting.entity.AppSetting;
import com.yooncount.book.domain.setting.repository.AppSettingRepository;
import com.yooncount.book.domain.user.entity.User;
import com.yooncount.book.domain.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class AppSettingService {

    public static final String KEY_FINNHUB_API_KEY = "finnhub.api-key";

    private final AppSettingRepository repository;
    private final UserRepository userRepository;

    public AppSettingService(AppSettingRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public Optional<String> get(Long ownerId, String key) {
        return repository.findByOwnerIdAndKey(ownerId, key)
                .map(AppSetting::getValue)
                .filter(v -> v != null && !v.isBlank());
    }

    @Transactional
    public void set(Long ownerId, String key, String value) {
        AppSetting setting = repository.findByOwnerIdAndKey(ownerId, key)
                .orElseGet(() -> {
                    User owner = userRepository.getReferenceById(ownerId);
                    return new AppSetting(owner, key, value);
                });
        setting.setValue(value);
        repository.save(setting);
    }

    @Transactional
    public void delete(Long ownerId, String key) {
        repository.deleteByOwnerIdAndKey(ownerId, key);
    }
}
