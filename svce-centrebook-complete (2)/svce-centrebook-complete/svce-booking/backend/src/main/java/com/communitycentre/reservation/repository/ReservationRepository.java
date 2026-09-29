package com.communitycentre.reservation.repository;

import com.communitycentre.model.Room;
import com.communitycentre.reservation.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.room = :room
        AND r.bookingDate = :date
        AND r.status = 'RESERVED'
        AND r.startTime < :endTime
        AND r.endTime > :startTime
    """)
    List<Reservation> findOverlappingReservations(
            @Param("room") Room room,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    List<Reservation> findByRoomOrderByBookingDateDescStartTimeDesc(Room room);

    List<Reservation> findByStatus(String status);

    List<Reservation> findByBookingDate(LocalDate bookingDate);
}