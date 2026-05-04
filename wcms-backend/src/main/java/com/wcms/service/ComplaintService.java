package com.wcms.service;

import com.wcms.dto.ComplaintRequest;
import com.wcms.entity.Complaint;
import com.wcms.entity.Zone;
import com.wcms.repository.ComplaintRepository;
import com.wcms.repository.UserRepository;
import com.wcms.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ZoneRepository zoneRepository;
    private final UserRepository userRepository;

    public Complaint submit(ComplaintRequest request) {
        Zone zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new RuntimeException("Zone not found: " + request.getZoneId()));

        Complaint complaint = new Complaint();
        complaint.setZone(zone);
        complaint.setDescription(request.getDescription());
        complaint.setStatus(Complaint.ComplaintStatus.OPEN);

        if (request.getUserId() != null) {
            userRepository.findById(request.getUserId()).ifPresent(complaint::setUser);
        }

        // Set a temporary tracking code to bypass nullable=false constraint
        complaint.setTrackingCode("TEMP-" + java.util.UUID.randomUUID().toString().substring(0, 8));

        // Save first to get generated ID
        Complaint saved = complaintRepository.save(complaint);

        // Generate tracking code using the ID
        String trackingCode = "WCMS-" + Year.now().getValue() + "-" + String.format("%05d", saved.getComplaintId());
        saved.setTrackingCode(trackingCode);
        return complaintRepository.save(saved);
    }

    public Complaint track(String trackingCode) {
        return complaintRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new RuntimeException("No complaint found with code: " + trackingCode));
    }

    public List<Complaint> getAll(Integer zoneId, String status) {
        if (zoneId != null && status != null) {
            Zone zone = zoneRepository.findById(zoneId).orElseThrow();
            return complaintRepository.findByZoneAndStatus(zone, Complaint.ComplaintStatus.valueOf(status));
        } else if (zoneId != null) {
            Zone zone = zoneRepository.findById(zoneId).orElseThrow();
            return complaintRepository.findByZone(zone);
        } else if (status != null) {
            return complaintRepository.findByStatus(Complaint.ComplaintStatus.valueOf(status));
        }
        return complaintRepository.findAll();
    }

    public Complaint updateStatus(Integer id, Complaint.ComplaintStatus newStatus, String resolution) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + id));
        complaint.setStatus(newStatus);
        if (resolution != null) {
            complaint.setResolution(resolution);
        }
        return complaintRepository.save(complaint);
    }
}
