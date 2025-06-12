package com.ELMS.ELMS.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ELMS.ELMS.Entity.DepartmentHead;

@Repository
public interface DepartmentHeadRepository extends JpaRepository<DepartmentHead,Long>{
    
    DepartmentHead findByEmployeeId(String employeeId);
    
}
