package com.wcms.service;

import com.wcms.entity.Zone;
import com.wcms.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;

    public List<Zone> getAll() {
        return zoneRepository.findAll();
    }

    public Zone getById(Integer id) {
        return zoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Zone not found: " + id));
    }

    public Zone create(Zone zone) {
        return zoneRepository.save(zone);
    }

    public Zone update(Integer id, Zone updated) {
        Zone existing = getById(id);
        existing.setZoneName(updated.getZoneName());
        existing.setDescription(updated.getDescription());
        return zoneRepository.save(existing);
    }

    public void delete(Integer id) {
        zoneRepository.deleteById(id);
    }
}
