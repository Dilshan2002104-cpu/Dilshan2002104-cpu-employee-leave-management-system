package com.ELMS.ELMS.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ELMS.ELMS.Entity.Employee;
import com.ELMS.ELMS.dto.EmployeeDTO;
import com.ELMS.ELMS.dto.LoginDTO;
import com.ELMS.ELMS.dto.LoginResponseDTO;
import com.ELMS.ELMS.dto.ResponseDTO;
import com.ELMS.ELMS.repository.EmployeeRepository;

@Service
public class EmployeeService {
    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ResponseDTO registerEmployee(EmployeeDTO dto) {
        if (employeeRepository.existsByEmployeeId(dto.getEmployeeId())) {
            return new ResponseDTO(false, "Employee ID already exists.");
        }

        String encodedPassword  = passwordEncoder.encode(dto.getPassword());

        Employee employee = new Employee(
            dto.getEmployeeId(),
            dto.getName(),
            dto.getDepartment(),
            encodedPassword
        );
        employeeRepository.save(employee);
        return new ResponseDTO(true, "Registration successful");
    }

public LoginResponseDTO loginEmployee(LoginDTO dto) {
    Employee employee = employeeRepository.findByEmployeeId(dto.getEmployeeId());
    if (employee != null && passwordEncoder.matches(dto.getPassword(), employee.getPassword())) {
        return new LoginResponseDTO(
            true,
            "Login successful",
            employee.getEmployeeId(),
            employee.getName(),
            employee.getDepartment()
        );
    }
    return new LoginResponseDTO(false, "Invalid credentials", null, null, null);
}


}
