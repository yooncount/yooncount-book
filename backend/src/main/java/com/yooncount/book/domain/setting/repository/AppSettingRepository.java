package com.yooncount.book.domain.setting.repository;

import com.yooncount.book.domain.setting.entity.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingRepository extends JpaRepository<AppSetting, String> {
}
