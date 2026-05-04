package com.wcms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "vehicles")
@Data
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer vehicleId;

    @Column(unique = true, nullable = false, length = 20)
    private String vehicleNumber;

    @Column(length = 50)
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    public enum VehicleStatus {
        AVAILABLE, IN_USE, MAINTENANCE
    }
}
