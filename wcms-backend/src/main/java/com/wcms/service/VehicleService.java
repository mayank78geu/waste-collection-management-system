package com.wcms.service;

import com.wcms.entity.Vehicle;
import com.wcms.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAll() {
        return vehicleRepository.findAll();
    }

    public Vehicle getById(Integer id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
    }

    public Vehicle create(Vehicle vehicle) {
        if (vehicleRepository.existsByVehicleNumber(vehicle.getVehicleNumber())) {
            throw new RuntimeException("Vehicle number already registered: " + vehicle.getVehicleNumber());
        }
        return vehicleRepository.save(vehicle);
    }

    public Vehicle update(Integer id, Vehicle updated) {
        Vehicle existing = getById(id);
        existing.setVehicleNumber(updated.getVehicleNumber());
        existing.setType(updated.getType());
        existing.setStatus(updated.getStatus());
        return vehicleRepository.save(existing);
    }

    public void delete(Integer id) {
        vehicleRepository.deleteById(id);
    }
}
