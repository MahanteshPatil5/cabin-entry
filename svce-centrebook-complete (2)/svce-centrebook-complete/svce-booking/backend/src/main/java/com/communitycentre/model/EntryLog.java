package com.communitycentre.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "entry_logs")
public class EntryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false)
    private String role;            // "Student" or "Professor"

    @Column(nullable = false)
    private String usnOrDept;       // USN for student, Dept for professor

    private String teamMembers;

    @Column(nullable = false)
    private String purpose;

    @Column(nullable = false)
    private int peopleCount;

    @Column(nullable = false)
    private LocalDateTime entryTime;

    private LocalDateTime exitTime;

    @Column(nullable = false)
    private boolean active = true;

    // Constructors
    public EntryLog() {}

    public EntryLog(Room room, String userName, String role, String usnOrDept,
                    String teamMembers, String purpose, int peopleCount) {
        this.room = room;
        this.userName = userName;
        this.role = role;
        this.usnOrDept = usnOrDept;
        this.teamMembers = teamMembers;
        this.purpose = purpose;
        this.peopleCount = peopleCount;
        this.entryTime = LocalDateTime.now();
        this.active = true;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getUsnOrDept() { return usnOrDept; }
    public void setUsnOrDept(String usnOrDept) { this.usnOrDept = usnOrDept; }

    public String getTeamMembers() { return teamMembers; }
    public void setTeamMembers(String teamMembers) { this.teamMembers = teamMembers; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public int getPeopleCount() { return peopleCount; }
    public void setPeopleCount(int peopleCount) { this.peopleCount = peopleCount; }

    public LocalDateTime getEntryTime() { return entryTime; }
    public void setEntryTime(LocalDateTime entryTime) { this.entryTime = entryTime; }

    public LocalDateTime getExitTime() { return exitTime; }
    public void setExitTime(LocalDateTime exitTime) { this.exitTime = exitTime; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    // Helper - get room name directly (useful for DTOs)
    public String getRoomName() { return room != null ? room.getName() : ""; }
}
