package com.wcms.service;

import com.wcms.entity.Staff;
import com.wcms.entity.User;
import com.wcms.entity.Zone;
import com.wcms.repository.StaffRepository;
import com.wcms.repository.UserRepository;
import com.wcms.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;

    public List<Staff> getAll() {
        return staffRepository.findAll();
    }

    public Staff getById(Integer id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found: " + id));
    }

    public Staff create(Integer userId, Integer zoneId, String designation) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (staffRepository.existsByUser(user)) {
            throw new RuntimeException("Staff record already exists for user: " + userId);
        }

        Zone zone = zoneId != null
                ? zoneRepository.findById(zoneId).orElseThrow(() -> new RuntimeException("Zone not found: " + zoneId))
                : null;

        Staff staff = new Staff();
        staff.setUser(user);
        staff.setZone(zone);
        staff.setDesignation(designation);
        return staffRepository.save(staff);
    }

    public Staff update(Integer id, Integer zoneId, String designation) {
        Staff existing = getById(id);
        Zone zone = zoneId != null
                ? zoneRepository.findById(zoneId).orElseThrow(() -> new RuntimeException("Zone not found: " + zoneId))
                : null;
        existing.setZone(zone);
        existing.setDesignation(designation);
        return staffRepository.save(existing);
    }

    public void delete(Integer id) {
        staffRepository.deleteById(id);
    }

    public Staff getByUser(User user) {
        return staffRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No staff record for user: " + user.getEmail()));
    }
}
