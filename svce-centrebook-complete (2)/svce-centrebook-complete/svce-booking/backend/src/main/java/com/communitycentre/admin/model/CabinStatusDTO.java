package com.communitycentre.admin.model;

public class CabinStatusDTO {

    private String name;
    private int capacity;
    private int occupied;
    private int available;
    private String status;

    public CabinStatusDTO() {
    }

    public CabinStatusDTO(
            String name,
            int capacity,
            int occupied,
            int available,
            String status) {

        this.name = name;
        this.capacity = capacity;
        this.occupied = occupied;
        this.available = available;
        this.status = status;
    }

    public String getName() {
        return name;
    }

    public int getCapacity() {
        return capacity;
    }

    public int getOccupied() {
        return occupied;
    }

    public int getAvailable() {
        return available;
    }

    public String getStatus() {
        return status;
    }
}