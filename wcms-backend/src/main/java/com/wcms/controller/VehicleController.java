package com.wcms.controller;

import com.wcms.common.ApiResponse;
import com.wcms.entity.Vehicle;
import com.wcms.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(vehicleService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Vehicle>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(vehicleService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Vehicle>> create(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(ApiResponse.ok("Vehicle registered", vehicleService.create(vehicle)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Vehicle>> update(@PathVariable Integer id, @RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(ApiResponse.ok("Vehicle updated", vehicleService.update(id, vehicle)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        vehicleService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle deleted", null));
    }
}
