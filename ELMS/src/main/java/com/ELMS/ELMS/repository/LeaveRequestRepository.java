package com.ELMS.ELMS.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ELMS.ELMS.Entity.LeaveRequest;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest,Long>{
    List<LeaveRequest> findByEmployeeId(String employeeId);
}
