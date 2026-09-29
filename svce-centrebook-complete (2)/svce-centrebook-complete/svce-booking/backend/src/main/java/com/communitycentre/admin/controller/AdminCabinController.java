package com.communitycentre.admin.controller;

import com.communitycentre.admin.service.AdminCabinService;
import com.communitycentre.model.Room;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cabins")
@CrossOrigin(origins = "*")
public class AdminCabinController {

    @Autowired
    private AdminCabinService adminCabinService;


    // GET ALL CABINS
    @GetMapping
    public ResponseEntity<List<Room>> getAllCabins() {

        return ResponseEntity.ok(
                adminCabinService.getAllCabins()
        );
    }


    // GET ONE CABIN
    @GetMapping("/{id}")
    public ResponseEntity<Room> getCabinById(
            @PathVariable Long id) {

        return adminCabinService.getCabinById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // ADD NEW CABIN
    @PostMapping
    public ResponseEntity<Room> addCabin(
            @RequestBody Room room) {

        return ResponseEntity.ok(
                adminCabinService.addCabin(room)
        );
    }


    // UPDATE CABIN
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateCabin(
            @PathVariable Long id,
            @RequestBody Room room) {

        return adminCabinService.updateCabin(id, room)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // DELETE CABIN
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCabin(
            @PathVariable Long id) {

        boolean deleted =
                adminCabinService.deleteCabin(id);

        if (deleted) {
            return ResponseEntity.ok(
                    java.util.Map.of(
                            "message",
                            "Cabin deleted successfully"
                    )
            );
        }

        return ResponseEntity.notFound().build();
    }
}