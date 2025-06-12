package com.ELMS.ELMS.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ELMS.ELMS.Entity.DepartmentHead;
import com.ELMS.ELMS.repository.DepartmentHeadRepository;

@Service
public class DepartmentHeadService {
     @Autowired
    private DepartmentHeadRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public DepartmentHead createDepartmentHead(DepartmentHead departmentHead) {
        departmentHead.setPassword(passwordEncoder.encode(departmentHead.getPassword()));
        departmentHead.setLastLogin(LocalDateTime.now());
        return repository.save(departmentHead);
    }

    public List<DepartmentHead> getAllDepartmentHeads() {
        return repository.findAll();
    }

    public DepartmentHead updateDepartmentHead(Long id, DepartmentHead updatedHead) {
        DepartmentHead existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department head not found"));
        existing.setEmployeeId(updatedHead.getEmployeeId());
        existing.setName(updatedHead.getName());
        existing.setDepartment(updatedHead.getDepartment());
        if (updatedHead.getPassword() != null && !updatedHead.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(updatedHead.getPassword()));
        }
        return repository.save(existing);
    }

    public void deleteDepartmentHead(Long id) {
        repository.deleteById(id);
    }

    public DepartmentHead toggleStatus(Long id) {
        DepartmentHead head = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department head not found"));
        head.setStatus(head.getStatus().equals("Active") ? "Inactive" : "Active");
        return repository.save(head);
    }
    
    public DepartmentHead login(String employeeId, String password) {
        DepartmentHead head = repository.findByEmployeeId(employeeId);
        if (head != null && passwordEncoder.matches(password, head.getPassword())) {
            head.setLastLogin(LocalDateTime.now());
            repository.save(head);
            return head;
        }
        return null;
    }
    // ...existing code...
}
