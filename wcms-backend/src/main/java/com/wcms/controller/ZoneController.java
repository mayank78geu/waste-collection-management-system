package com.wcms.controller;

import com.wcms.common.ApiResponse;
import com.wcms.entity.Zone;
import com.wcms.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Zone>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(zoneService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Zone>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(zoneService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Zone>> create(@RequestBody Zone zone) {
        return ResponseEntity.ok(ApiResponse.ok("Zone created", zoneService.create(zone)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Zone>> update(@PathVariable Integer id, @RequestBody Zone zone) {
        return ResponseEntity.ok(ApiResponse.ok("Zone updated", zoneService.update(id, zone)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        zoneService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Zone deleted", null));
    }
}
