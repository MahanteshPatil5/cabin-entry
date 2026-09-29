package com.communitycentre.admin.service;

import com.communitycentre.admin.model.Admin;
import com.communitycentre.admin.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminAuthService {

    @Autowired
    private AdminRepository adminRepository;

    public boolean login(String username, String password) {

        Optional<Admin> admin = adminRepository.findByUsername(username);

        if (admin.isPresent()) {

            Admin existingAdmin = admin.get();

            return existingAdmin.getPassword().equals(password);
        }

        return false;
    }
}