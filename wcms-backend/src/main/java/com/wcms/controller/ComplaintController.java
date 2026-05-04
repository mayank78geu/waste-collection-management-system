package com.wcms.controller;

import com.wcms.common.ApiResponse;
import com.wcms.dto.ComplaintRequest;
import com.wcms.entity.Complaint;
import com.wcms.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    /**
     * POST /api/complaints — Public, no auth required.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Complaint>> submit(@Valid @RequestBody ComplaintRequest request) {
        Complaint complaint = complaintService.submit(request);
        return ResponseEntity.ok(ApiResponse.ok("Complaint submitted. Tracking code: " + complaint.getTrackingCode(), complaint));
    }

    /**
     * GET /api/complaints/track/{code} — Public tracking.
     */
    @GetMapping("/track/{code}")
    public ResponseEntity<ApiResponse<Complaint>> track(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(complaintService.track(code)));
    }

    /**
     * GET /api/complaints?zone=&status= — Supervisor views and filters complaints.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Complaint>>> getAll(
            @RequestParam(required = false) Integer zone,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(complaintService.getAll(zone, status)));
    }

    /**
     * PUT /api/complaints/{id}/status — Supervisor resolves complaint.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Complaint>> updateStatus(
            @PathVariable Integer id,
            @RequestBody StatusUpdateRequest request) {
        Complaint updated = complaintService.updateStatus(
                id,
                Complaint.ComplaintStatus.valueOf(request.getStatus()),
                request.getResolution()
        );
        return ResponseEntity.ok(ApiResponse.ok("Complaint updated", updated));
    }

    @Data
    static class StatusUpdateRequest {
        private String status;      // OPEN, IN_PROGRESS, RESOLVED
        private String resolution;  // optional notes
    }
}
