package com.financetracker.config;

import com.financetracker.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public CommandLineRunner initData(CategoryRepository categoryRepository) {
        return args -> categoryRepository.initDefaults();
    }
}
