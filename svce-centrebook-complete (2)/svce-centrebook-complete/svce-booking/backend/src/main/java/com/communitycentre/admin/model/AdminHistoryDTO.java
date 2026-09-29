package com.communitycentre.admin.model;

import java.time.LocalDateTime;

public class AdminHistoryDTO {

    private String name;
    private String role;
    private String usn;
    private int peopleCount;
    private String cabin;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;

    public AdminHistoryDTO() {
    }

    public AdminHistoryDTO(
            String name,
            String role,
            String usn,
            int peopleCount,
            String cabin,
            LocalDateTime entryTime,
            LocalDateTime exitTime) {

        this.name = name;
        this.role = role;
        this.usn = usn;
        this.peopleCount = peopleCount;
        this.cabin = cabin;
        this.entryTime = entryTime;
        this.exitTime = exitTime;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public String getUsn() {
        return usn;
    }

    public int getPeopleCount() {
        return peopleCount;
    }

    public String getCabin() {
        return cabin;
    }

    public LocalDateTime getEntryTime() {
        return entryTime;
    }

    public LocalDateTime getExitTime() {
        return exitTime;
    }
}