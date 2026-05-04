package com.wcms.config;

import com.wcms.entity.User;
import com.wcms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmail("admin@wcms.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@wcms.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            log.info("✅ Seed: Admin user created — admin@wcms.com / admin123");
        } else {
            log.info("✅ Seed: Admin user already exists, skipping.");
        }
    }
}
