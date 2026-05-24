package com.yooncount.book.domain.setting.service;

import com.yooncount.book.domain.setting.entity.AppSetting;
import com.yooncount.book.domain.setting.repository.AppSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class AppSettingService {

    public static final String KEY_FINNHUB_API_KEY = "finnhub.api-key";

    private final AppSettingRepository repository;

    public AppSettingService(AppSettingRepository repository) {
        this.repository = repository;
    }

    public Optional<String> get(String key) {
        return repository.findById(key)
                .map(AppSetting::getValue)
                .filter(v -> v != null && !v.isBlank());
    }

    @Transactional
    public void set(String key, String value) {
        AppSetting setting = repository.findById(key)
                .orElse(new AppSetting(key, value));
        setting.setValue(value);
        repository.save(setting);
    }

    @Transactional
    public void delete(String key) {
        repository.deleteById(key);
    }
}
