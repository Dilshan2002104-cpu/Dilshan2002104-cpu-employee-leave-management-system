package com.ELMS.ELMS.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ELMS.ELMS.Entity.LeaveRequest;
import com.ELMS.ELMS.dto.LeaveRequestDTO;
import com.ELMS.ELMS.service.LeaveRequestService;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin
public class LeaveRequestController {

    private final LeaveRequestService leaveService;

    public LeaveRequestController(LeaveRequestService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping("/submit")
    public String submitLeave(@RequestBody LeaveRequestDTO dto) {
        return leaveService.submitLeaveRequest(dto);
    }

    @GetMapping("/by-employee/{id}")
    public List<LeaveRequest> getLeavesByEmployeeId(@PathVariable("id") String employeeId) {
        return leaveService.getLeaveRequestsByEmployeeId(employeeId);
    }

    @GetMapping("/all")
    public List<LeaveRequest> getAllLeaves() {
        return leaveService.getAllLeaveRequests();
    }

    @PutMapping("/update-status/{id}")
    public String updateLeaveStatus(@PathVariable("id") Long leaveId, @RequestParam String status) {
        return leaveService.updateLeaveStatus(leaveId, status);
    }

}
