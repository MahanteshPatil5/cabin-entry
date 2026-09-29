package com.communitycentre.admin.model;

public class AnalyticsDTO {

    private String label;
    private double value;

    public AnalyticsDTO() {
    }

    public AnalyticsDTO(String label, double value) {
        this.label = label;
        this.value = value;
    }

    public String getLabel() {
        return label;
    }

    public double getValue() {
        return value;
    }
}