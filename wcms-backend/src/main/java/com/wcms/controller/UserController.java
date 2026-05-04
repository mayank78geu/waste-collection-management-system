package com.wcms.controller;

import com.wcms.common.ApiResponse;
import com.wcms.entity.User;
import com.wcms.repository.UserRepository;
import com.wcms.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(userRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getById(@PathVariable Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> create(@RequestBody CreateUserRequest request) {
        User user = authService.register(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                User.Role.valueOf(request.getRole())
        );
        return ResponseEntity.ok(ApiResponse.ok("User created", user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> update(@PathVariable Integer id, @RequestBody UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setName(request.getName());
        user.setRole(User.Role.valueOf(request.getRole()));
        return ResponseEntity.ok(ApiResponse.ok("User updated", userRepository.save(user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }

    @Data
    static class CreateUserRequest {
        private String name;
        private String email;
        private String password;
        private String role;  // ADMIN, SUPERVISOR, DRIVER, CITIZEN
    }

    @Data
    static class UpdateUserRequest {
        private String name;
        private String role;
    }
}
