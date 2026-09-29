package com.communitycentre.admin.model;

import java.util.List;

public class AdminDashboardDTO {

    private int totalCabins;
    private int availableCabins;
    private int partiallyOccupiedCabins;
    private int fullCabins;
    private int peopleInside;
    private int todayVisits;
    private int activeVisits;
    private int completedVisitsToday;

    private List<CabinStatusDTO> cabinStatus;
    private List<AnalyticsDTO> mostUsedCabins;
    private List<AnalyticsDTO> roleUsage;
    private List<AnalyticsDTO> averagePeoplePerCabin;

    public AdminDashboardDTO() {
    }

    public AdminDashboardDTO(
            int totalCabins,
            int availableCabins,
            int partiallyOccupiedCabins,
            int fullCabins,
            int peopleInside,
            int todayVisits,
            int activeVisits,
            int completedVisitsToday,
            List<CabinStatusDTO> cabinStatus,
            List<AnalyticsDTO> mostUsedCabins,
            List<AnalyticsDTO> roleUsage,
            List<AnalyticsDTO> averagePeoplePerCabin) {

        this.totalCabins = totalCabins;
        this.availableCabins = availableCabins;
        this.partiallyOccupiedCabins = partiallyOccupiedCabins;
        this.fullCabins = fullCabins;
        this.peopleInside = peopleInside;
        this.todayVisits = todayVisits;
        this.activeVisits = activeVisits;
        this.completedVisitsToday = completedVisitsToday;
        this.cabinStatus = cabinStatus;
        this.mostUsedCabins = mostUsedCabins;
        this.roleUsage = roleUsage;
        this.averagePeoplePerCabin = averagePeoplePerCabin;
    }

    public int getTotalCabins() {
        return totalCabins;
    }

    public int getAvailableCabins() {
        return availableCabins;
    }

    public int getPartiallyOccupiedCabins() {
        return partiallyOccupiedCabins;
    }

    public int getFullCabins() {
        return fullCabins;
    }

    public int getPeopleInside() {
        return peopleInside;
    }

    public int getTodayVisits() {
        return todayVisits;
    }

    public int getActiveVisits() {
        return activeVisits;
    }

    public int getCompletedVisitsToday() {
        return completedVisitsToday;
    }

    public List<CabinStatusDTO> getCabinStatus() {
        return cabinStatus;
    }

    public List<AnalyticsDTO> getMostUsedCabins() {
        return mostUsedCabins;
    }

    public List<AnalyticsDTO> getRoleUsage() {
        return roleUsage;
    }

    public List<AnalyticsDTO> getAveragePeoplePerCabin() {
        return averagePeoplePerCabin;
    }
}