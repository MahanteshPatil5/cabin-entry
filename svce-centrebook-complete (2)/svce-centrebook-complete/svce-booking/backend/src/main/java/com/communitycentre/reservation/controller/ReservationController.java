package com.communitycentre.reservation.controller;

import com.communitycentre.model.Room;
import com.communitycentre.reservation.model.Reservation;
import com.communitycentre.reservation.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prebook")
@CrossOrigin(origins = "*")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;


    // Find cabins available for selected date and time
    @GetMapping("/availability")
    public ResponseEntity<?> getAvailableRooms(
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {

        try {

            LocalDate bookingDate = LocalDate.parse(date);
            LocalTime start = LocalTime.parse(startTime);
            LocalTime end = LocalTime.parse(endTime);

            if (!start.isBefore(end)) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "message",
                                "End time must be after start time."
                        )
                );
            }

            List<Room> rooms =
                    reservationService.getAvailableRooms(
                            bookingDate,
                            start,
                            end
                    );

            return ResponseEntity.ok(rooms);

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            e.getMessage()
                    )
            );
        }
    }


    // Create reservation
    @PostMapping
    public ResponseEntity<?> createReservation(
            @RequestBody ReservationRequest request) {

        try {

            Reservation reservation =
                    reservationService.createReservation(
                            request.roomId,
                            request.userName,
                            request.role,
                            request.usnOrDept,
                            request.teamMembers,
                            request.purpose,
                            request.peopleCount,
                            LocalDate.parse(request.bookingDate),
                            LocalTime.parse(request.startTime),
                            LocalTime.parse(request.endTime)
                    );

            return ResponseEntity.ok(reservation);

        } catch (IllegalStateException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            e.getMessage()
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            e.getMessage()
                    )
            );
        }
    }


    // Get all reservations
    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {

        return ResponseEntity.ok(
                reservationService.getAllReservations()
        );
    }


    // Get reservation by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getReservationById(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    reservationService.getReservationById(id)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.notFound().build();
        }
    }


    // Request DTO
    public static class ReservationRequest {

        public Long roomId;
        public String userName;
        public String role;
        public String usnOrDept;
        public String teamMembers;
        public String purpose;
        public int peopleCount;
        public String bookingDate;
        public String startTime;
        public String endTime;
    }
}