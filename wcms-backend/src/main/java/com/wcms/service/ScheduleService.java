package com.wcms.service;

import com.wcms.dto.ScheduleRequest;
import com.wcms.entity.*;
import com.wcms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ZoneRepository zoneRepository;
    private final VehicleRepository vehicleRepository;
    private final StaffRepository staffRepository;

    public Schedule create(ScheduleRequest request, User createdBy) {
        Zone zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new RuntimeException("Zone not found"));
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        Staff staff = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // Double-booking validation (Step 16 in PRD)
        if (scheduleRepository.existsByVehicleAndDateAndTimeSlot(vehicle, request.getDate(), request.getTimeSlot())) {
            throw new RuntimeException("Vehicle already assigned at this date and time slot");
        }
        if (scheduleRepository.existsByStaffAndDateAndTimeSlot(staff, request.getDate(), request.getTimeSlot())) {
            throw new RuntimeException("Staff already assigned at this date and time slot");
        }

        Schedule schedule = new Schedule();
        schedule.setZone(zone);
        schedule.setVehicle(vehicle);
        schedule.setStaff(staff);
        schedule.setDate(request.getDate());
        schedule.setTimeSlot(request.getTimeSlot());
        schedule.setStatus(Schedule.ScheduleStatus.PENDING);
        schedule.setCreatedBy(createdBy);
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getByDate(LocalDate date) {
        return scheduleRepository.findByDate(date);
    }

    public List<Schedule> getByStaffAndDate(Staff staff, LocalDate date) {
        return scheduleRepository.findByStaffAndDate(staff, date);
    }

    public List<Schedule> getUpcoming(Staff staff) {
        return scheduleRepository.findByStaffAndDateGreaterThanEqual(staff, LocalDate.now());
    }

    public Schedule updateStatus(Integer id, Schedule.ScheduleStatus status) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + id));
        schedule.setStatus(status);
        return scheduleRepository.save(schedule);
    }

    public void delete(Integer id) {
        scheduleRepository.deleteById(id);
    }
}
