package com.ELMS.ELMS.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ELMS.ELMS.Entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee,String>{
    Employee findByEmployeeIdAndPassword(String employeeId, String password);
    boolean existsByEmployeeId(String employeeId);
    Employee findByEmployeeId(String employeeId);

}
