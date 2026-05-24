package com.yooncount.book.domain.setting.repository;

import com.yooncount.book.domain.setting.entity.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppSettingRepository extends JpaRepository<AppSetting, Long> {

    Optional<AppSetting> findByOwnerIdAndKey(Long ownerId, String key);

    void deleteByOwnerIdAndKey(Long ownerId, String key);
}
