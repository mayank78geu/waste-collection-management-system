package com.wcms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComplaintRequest {

    @NotNull(message = "Zone ID is required")
    private Integer zoneId;

    @NotBlank(message = "Description is required")
    private String description;

    // Optional — citizen may or may not be logged in
    private Integer userId;
}
