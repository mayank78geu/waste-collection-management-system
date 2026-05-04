package com.wcms.repository;

import com.wcms.entity.Complaint;
import com.wcms.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {
    Optional<Complaint> findByTrackingCode(String trackingCode);
    List<Complaint> findByZone(Zone zone);
    List<Complaint> findByStatus(Complaint.ComplaintStatus status);
    List<Complaint> findByZoneAndStatus(Zone zone, Complaint.ComplaintStatus status);
}
