package com.wcms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "zones")
@Data
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer zoneId;

    @Column(nullable = false, length = 100)
    private String zoneName;

    @Column(columnDefinition = "TEXT")
    private String description;
}
