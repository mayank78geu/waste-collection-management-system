package com.wcms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ScheduleRequest {

    @NotNull(message = "Zone ID is required")
    private Integer zoneId;

    @NotNull(message = "Vehicle ID is required")
    private Integer vehicleId;

    @NotNull(message = "Staff ID is required")
    private Integer staffId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;  // e.g. "08:00-10:00"
}
