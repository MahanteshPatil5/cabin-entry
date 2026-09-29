package com.communitycentre.admin.service;

import com.communitycentre.admin.model.AdminDashboardDTO;
import com.communitycentre.admin.model.AnalyticsDTO;
import com.communitycentre.admin.model.CabinStatusDTO;
import com.communitycentre.model.EntryLog;
import com.communitycentre.model.Room;
import com.communitycentre.repository.EntryLogRepository;
import com.communitycentre.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private EntryLogRepository entryLogRepository;


    public AdminDashboardDTO getDashboard() {

        List<Room> rooms = roomRepository.findAll();
        List<EntryLog> allEntries = entryLogRepository.findAll();

        LocalDate today = LocalDate.now();


        // ==========================================
        // LIVE CABIN STATUS
        // ==========================================

        List<CabinStatusDTO> cabinStatus = new ArrayList<>();

        int availableCabins = 0;
        int partiallyOccupiedCabins = 0;
        int fullCabins = 0;
        int peopleInside = 0;


        for (Room room : rooms) {

            int occupied =
                    entryLogRepository
                            .sumActivePeopleCountByRoom(room);

            int available =
                    Math.max(0, room.getCapacity() - occupied);

            String status;

            if (occupied == 0) {

                status = "AVAILABLE";
                availableCabins++;

            } else if (occupied >= room.getCapacity()) {

                status = "FULL";
                fullCabins++;

            } else {

                status = "PARTIAL";
                partiallyOccupiedCabins++;

            }


            peopleInside += occupied;


            cabinStatus.add(
                    new CabinStatusDTO(
                            room.getName(),
                            room.getCapacity(),
                            occupied,
                            available,
                            status
                    )
            );
        }


        // ==========================================
        // TODAY'S VISITS
        // ==========================================

        List<EntryLog> todayEntries =
                allEntries.stream()
                        .filter(e ->
                                e.getEntryTime() != null &&
                                e.getEntryTime()
                                        .toLocalDate()
                                        .equals(today)
                        )
                        .collect(Collectors.toList());


        int todayVisits =
                todayEntries.size();


        int activeVisits =
                (int) todayEntries.stream()
                        .filter(EntryLog::isActive)
                        .count();


        int completedVisitsToday =
                (int) todayEntries.stream()
                        .filter(e ->
                                !e.isActive() &&
                                e.getExitTime() != null
                        )
                        .count();


        // ==========================================
        // MOST USED CABINS
        // ==========================================

        Map<String, Long> cabinUsage =
                allEntries.stream()
                        .filter(e -> e.getRoom() != null)
                        .collect(Collectors.groupingBy(
                                e -> e.getRoom().getName(),
                                Collectors.counting()
                        ));


        List<AnalyticsDTO> mostUsedCabins =
                cabinUsage.entrySet()
                        .stream()
                        .sorted(
                                Map.Entry
                                        .<String, Long>comparingByValue()
                                        .reversed()
                        )
                        .limit(5)
                        .map(e ->
                                new AnalyticsDTO(
                                        e.getKey(),
                                        e.getValue()
                                )
                        )
                        .collect(Collectors.toList());


        // ==========================================
        // STUDENT / PROFESSOR USAGE
        // ==========================================

        Map<String, Long> roleUsageMap =
                allEntries.stream()
                        .collect(Collectors.groupingBy(
                                e -> e.getRole() == null
                                        ? "UNKNOWN"
                                        : e.getRole(),
                                Collectors.counting()
                        ));


        List<AnalyticsDTO> roleUsage =
                roleUsageMap.entrySet()
                        .stream()
                        .map(e ->
                                new AnalyticsDTO(
                                        e.getKey(),
                                        e.getValue()
                                )
                        )
                        .collect(Collectors.toList());


        // ==========================================
        // AVERAGE PEOPLE PER CABIN
        // ==========================================

        Map<String, List<EntryLog>> entriesByCabin =
                allEntries.stream()
                        .filter(e -> e.getRoom() != null)
                        .collect(Collectors.groupingBy(
                                e -> e.getRoom().getName()
                        ));


        List<AnalyticsDTO> averagePeoplePerCabin =
                entriesByCabin.entrySet()
                        .stream()
                        .map(e -> {

                            double average =
                                    e.getValue()
                                            .stream()
                                            .mapToInt(
                                                    EntryLog::getPeopleCount
                                            )
                                            .average()
                                            .orElse(0);

                            return new AnalyticsDTO(
                                    e.getKey(),
                                    Math.round(
                                            average * 10.0
                                    ) / 10.0
                            );
                        })
                        .collect(Collectors.toList());


        // ==========================================
        // RETURN DASHBOARD
        // ==========================================

        return new AdminDashboardDTO(
                rooms.size(),
                availableCabins,
                partiallyOccupiedCabins,
                fullCabins,
                peopleInside,
                todayVisits,
                activeVisits,
                completedVisitsToday,
                cabinStatus,
                mostUsedCabins,
                roleUsage,
                averagePeoplePerCabin
        );
    }
}