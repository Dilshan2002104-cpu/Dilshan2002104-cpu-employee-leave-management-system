package com.ELMS.ELMS.dto;

public class LoginResponseDTO {
    
    private boolean success;
    private String message;
    private String employeeId;
    private String name;
    private String department;

    public LoginResponseDTO() {}

    public LoginResponseDTO(boolean success, String message, String employeeId, String name, String department) {
        this.success = success;
        this.message = message;
        this.employeeId = employeeId;
        this.name = name;
        this.department = department;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
