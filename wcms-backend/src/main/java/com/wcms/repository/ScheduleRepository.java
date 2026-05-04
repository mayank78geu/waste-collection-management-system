package com.wcms.repository;

import com.wcms.entity.Schedule;
import com.wcms.entity.Staff;
import com.wcms.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {

    // Double-booking checks
    boolean existsByVehicleAndDateAndTimeSlot(Vehicle vehicle, LocalDate date, String timeSlot);
    boolean existsByStaffAndDateAndTimeSlot(Staff staff, LocalDate date, String timeSlot);

    // Supervisor: get all schedules for a date
    List<Schedule> findByDate(LocalDate date);

    // Driver: get schedules for a specific staff on a date
    List<Schedule> findByStaffAndDate(Staff staff, LocalDate date);

    // Driver: get upcoming schedules
    List<Schedule> findByStaffAndDateGreaterThanEqual(Staff staff, LocalDate date);
}
