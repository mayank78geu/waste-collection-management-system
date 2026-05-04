package com.wcms.controller;

import com.wcms.common.ApiResponse;
import com.wcms.dto.ScheduleRequest;
import com.wcms.entity.*;
import com.wcms.repository.UserRepository;
import com.wcms.service.ScheduleService;
import com.wcms.service.StaffService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final StaffService staffService;
    private final UserRepository userRepository;

    /**
     * POST /api/schedules — Supervisor creates a schedule.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Schedule>> create(
            @Valid @RequestBody ScheduleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User creator = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Schedule schedule = scheduleService.create(request, creator);
        return ResponseEntity.ok(ApiResponse.ok("Schedule created", schedule));
    }

    /**
     * GET /api/schedules?date=YYYY-MM-DD — Supervisor views all schedules for a date.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Schedule>>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(scheduleService.getByDate(date)));
    }

    /**
     * GET /api/schedules/my?date=YYYY-MM-DD — Driver sees their own tasks.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<List<Schedule>>> getMySchedules(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Staff staff = staffService.getByUser(user);

        List<Schedule> schedules = (date != null)
                ? scheduleService.getByStaffAndDate(staff, date)
                : scheduleService.getUpcoming(staff);

        return ResponseEntity.ok(ApiResponse.ok(schedules));
    }

    /**
     * PUT /api/schedules/{id}/status — Driver updates task status.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DRIVER', 'SUPERVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Schedule>> updateStatus(
            @PathVariable Integer id,
            @RequestBody StatusUpdateRequest request) {
        Schedule updated = scheduleService.updateStatus(id, Schedule.ScheduleStatus.valueOf(request.getStatus()));
        return ResponseEntity.ok(ApiResponse.ok("Status updated", updated));
    }

    /**
     * DELETE /api/schedules/{id} — Supervisor cancels a schedule.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        scheduleService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Schedule deleted", null));
    }

    @Data
    static class StatusUpdateRequest {
        private String status;  // PENDING, COMPLETED, MISSED
    }
}
