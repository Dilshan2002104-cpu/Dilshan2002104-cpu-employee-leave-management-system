package com.ELMS.ELMS.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ELMS.ELMS.Entity.DepartmentHead;
import com.ELMS.ELMS.dto.DepartmentHeadLoginResponse;
import com.ELMS.ELMS.service.DepartmentHeadService;

@RestController
@RequestMapping("/api/heads")
@CrossOrigin
public class DepartmentHeadController {
    @Autowired
    private DepartmentHeadService service;

    @PostMapping("/create")
    public ResponseEntity<String> createDepartmentHead(@RequestBody DepartmentHead departmentHead) {
        try {
            service.createDepartmentHead(departmentHead);
            return ResponseEntity.ok("Department head created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create department head: " + e.getMessage());
        }
    }

    @GetMapping("/all-heads")
    public List<DepartmentHead> getAllDepartmentHeads() {
        return service.getAllDepartmentHeads();
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateDepartmentHead(@PathVariable Long id,
            @RequestBody DepartmentHead departmentHead) {
        try {
            service.updateDepartmentHead(id, departmentHead);
            return ResponseEntity.ok("Department head updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update department head: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDepartmentHead(@PathVariable Long id) {
        try {
            service.deleteDepartmentHead(id);
            return ResponseEntity.ok("Department head deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete department head: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DepartmentHead> toggleStatus(@PathVariable Long id) {
        try {
            DepartmentHead updatedHead = service.toggleStatus(id);
            return ResponseEntity.ok(updatedHead);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginDepartmentHead(@RequestBody Map<String, String> loginData) {
        String employeeId = loginData.get("employeeId");
        String password = loginData.get("password");
        try {
            DepartmentHead head = service.login(employeeId, password);
            if (head != null) {
                DepartmentHeadLoginResponse response = new DepartmentHeadLoginResponse(
                        head.getEmployeeId(),
                        head.getName(),
                        head.getDepartment());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body("Invalid credentials");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Login failed: " + e.getMessage());
        }
    }
}
