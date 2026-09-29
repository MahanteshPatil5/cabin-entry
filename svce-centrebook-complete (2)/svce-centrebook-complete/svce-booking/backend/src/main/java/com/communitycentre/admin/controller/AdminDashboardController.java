package com.communitycentre.admin.controller;

import com.communitycentre.admin.model.AdminDashboardDTO;
import com.communitycentre.admin.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @GetMapping
    public ResponseEntity<AdminDashboardDTO> getDashboard() {

        return ResponseEntity.ok(
                adminDashboardService.getDashboard()
        );
    }
}