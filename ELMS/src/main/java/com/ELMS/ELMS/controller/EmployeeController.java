package com.ELMS.ELMS.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ELMS.ELMS.dto.EmployeeDTO;
import com.ELMS.ELMS.dto.LoginDTO;
import com.ELMS.ELMS.dto.LoginResponseDTO;
import com.ELMS.ELMS.dto.ResponseDTO;
import com.ELMS.ELMS.service.EmployeeService;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin
public class EmployeeController {
    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/register")
    public ResponseDTO register(@RequestBody EmployeeDTO employeeDTO) {
        return employeeService.registerEmployee(employeeDTO);
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginDTO loginDTO) {
        return employeeService.loginEmployee(loginDTO);
    }

}
