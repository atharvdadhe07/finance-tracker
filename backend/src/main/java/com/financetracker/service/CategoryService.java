package com.financetracker.service;

import com.financetracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<String> getAll() {
        return categoryRepository.findAll().stream()
                .sorted()
                .toList();
    }

    public List<String> add(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Category name cannot be blank");
        }
        categoryRepository.add(name.trim());
        return getAll();
    }
}
