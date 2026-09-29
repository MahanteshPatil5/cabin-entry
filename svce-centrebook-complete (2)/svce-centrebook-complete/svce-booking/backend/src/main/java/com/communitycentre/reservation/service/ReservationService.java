package com.communitycentre.reservation.service;

import com.communitycentre.model.Room;
import com.communitycentre.repository.RoomRepository;
import com.communitycentre.reservation.model.Reservation;
import com.communitycentre.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomRepository roomRepository;


    public List<Room> getAvailableRooms(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime) {

        List<Room> rooms = roomRepository.findAll();

        return rooms.stream()
                .filter(room -> {

                    List<Reservation> overlapping =
                            reservationRepository.findOverlappingReservations(
                                    room,
                                    date,
                                    startTime,
                                    endTime
                            );

                    return overlapping.isEmpty();
                })
                .toList();
    }


    @Transactional
    public Reservation createReservation(
            Long roomId,
            String userName,
            String role,
            String usnOrDept,
            String teamMembers,
            String purpose,
            int peopleCount,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime) {

        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            throw new IllegalArgumentException(
                    "End time must be after start time."
            );
        }

        if (peopleCount <= 0) {
            throw new IllegalArgumentException(
                    "People count must be greater than zero."
            );
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Room not found.")
                );

        if (peopleCount > room.getCapacity()) {
            throw new IllegalStateException(
                    "Number of attendees exceeds room capacity. Capacity: "
                            + room.getCapacity()
            );
        }

        List<Reservation> overlapping =
                reservationRepository.findOverlappingReservations(
                        room,
                        bookingDate,
                        startTime,
                        endTime
                );

        if (!overlapping.isEmpty()) {
            throw new IllegalStateException(
                    "This cabin is already reserved for the selected time."
            );
        }

        Reservation reservation = new Reservation();

        reservation.setRoom(room);
        reservation.setUserName(userName);
        reservation.setRole(role);
        reservation.setUsnOrDept(usnOrDept);
        reservation.setTeamMembers(teamMembers);
        reservation.setPurpose(purpose);
        reservation.setPeopleCount(peopleCount);
        reservation.setBookingDate(bookingDate);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setStatus("RESERVED");

        return reservationRepository.save(reservation);
    }


    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }


    public Reservation getReservationById(Long id) {

        return reservationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Reservation not found."
                        )
                );
    }
}