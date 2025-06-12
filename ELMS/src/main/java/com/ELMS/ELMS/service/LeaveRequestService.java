package com.ELMS.ELMS.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ELMS.ELMS.Entity.LeaveRequest;
import com.ELMS.ELMS.dto.LeaveRequestDTO;
import com.ELMS.ELMS.repository.LeaveRequestRepository;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRepo;

    public LeaveRequestService(LeaveRequestRepository leaveRepo) {
        this.leaveRepo = leaveRepo;
    }

    public String submitLeaveRequest(LeaveRequestDTO dto) {
        LeaveRequest leave = new LeaveRequest();

        leave.setType(dto.getType());
        leave.setStartDate(dto.getStartDate());
        leave.setEndDate(dto.getEndDate());
        leave.setDays((int) ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1);
        leave.setReason(dto.getReason());
        leave.setEmployeeId(dto.getEmployeeId());
        leave.setDepartment(dto.getDepartment());
        leave.setStatus("Pending");
        leave.setAppliedDate(LocalDate.now());

        leaveRepo.save(leave);
        return "Leave request submitted successfully";
    }

    public List<LeaveRequest> getLeaveRequestsByEmployeeId(String employeeId) {
        return leaveRepo.findByEmployeeId(employeeId);
    }

    // ...existing code...

    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRepo.findAll();
    }

    public String updateLeaveStatus(Long leaveId, String status) {
        LeaveRequest leave = leaveRepo.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leave.setStatus(status);
        leaveRepo.save(leave);
        return "Leave status updated successfully";
    }

}
