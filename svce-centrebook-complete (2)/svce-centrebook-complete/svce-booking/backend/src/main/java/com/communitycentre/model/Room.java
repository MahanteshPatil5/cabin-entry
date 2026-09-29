package com.communitycentre.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false)
    private int occupied = 0;

    // Constructors
    public Room() {}

    public Room(String name, String type, int capacity) {
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.occupied = 0;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public int getOccupied() { return occupied; }
    public void setOccupied(int occupied) { this.occupied = occupied; }

    // Convenience
    public boolean isFull() { return occupied >= capacity; }
    public int availableSeats() { return capacity - occupied; }
    public String getStatus() {
        if (occupied == 0) return "available";
        if (occupied >= capacity) return "full";
        return "partial";
    }
}
