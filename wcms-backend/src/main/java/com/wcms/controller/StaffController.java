package com.wcms.controller;

import com.wcms.common.ApiResponse;
import com.wcms.entity.Staff;
import com.wcms.service.StaffService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<List<Staff>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(staffService.getAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<Staff>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(staffService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Staff>> create(@RequestBody StaffCreateRequest request) {
        Staff staff = staffService.create(request.getUserId(), request.getZoneId(), request.getDesignation());
        return ResponseEntity.ok(ApiResponse.ok("Staff registered", staff));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Staff>> update(@PathVariable Integer id, @RequestBody StaffCreateRequest request) {
        Staff staff = staffService.update(id, request.getZoneId(), request.getDesignation());
        return ResponseEntity.ok(ApiResponse.ok("Staff updated", staff));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        staffService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Staff deleted", null));
    }

    @Data
    static class StaffCreateRequest {
        private Integer userId;
        private Integer zoneId;
        private String designation;
    }
}
