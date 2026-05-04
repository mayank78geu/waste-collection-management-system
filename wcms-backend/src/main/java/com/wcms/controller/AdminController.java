package com.wcms.controller;

import com.wcms.common.ApiResponse;
import com.wcms.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final VehicleRepository vehicleRepository;
    private final StaffRepository staffRepository;

    /**
     * GET /api/admin/dashboard/summary
     * Returns aggregate counts for the Admin Dashboard.
     */
    @GetMapping("/dashboard/summary")
    public ResponseEntity<ApiResponse<DashboardSummary>> getSummary() {
        DashboardSummary summary = new DashboardSummary(
                zoneRepository.count(),
                vehicleRepository.count(),
                staffRepository.count(),
                userRepository.count()
        );
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @Data
    static class DashboardSummary {
        private final long totalZones;
        private final long totalVehicles;
        private final long totalStaff;
        private final long totalUsers;
    }
}
