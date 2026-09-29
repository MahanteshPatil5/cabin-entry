package com.communitycentre.admin.controller;

import com.communitycentre.admin.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminAuthController {

    @Autowired
    private AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestParam String username,
            @RequestParam String password) {

        boolean success = adminAuthService.login(username, password);

        if (success) {
            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message", "Admin login successful"
                    )
            );
        }

        return ResponseEntity.status(401).body(
                Map.of(
                        "success", false,
                        "message", "Invalid username or password"
                )
        );
    }
}