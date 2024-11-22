import React from "react";
import { Link } from "react-router-dom";

const AdminMenu = () => {
    return(
        <div className="AdminMenu">
            <div className="AdminMenuInset card">
                <h1>Admin Menu</h1>
                <hr/>
                <Link to='/Admin/AddUser'>Add User</Link><br/>
                <Link to='/Admin/DeleteEmployee'>Delete Employee</Link><br/>
                <Link to='/Admin/ViewEmployees'>View Employees</Link><br/>
                <Link to='/Admin/UpdateEmployeeRecord'>Update Employee Record</Link><br/>
                <Link to='/Admin/CreateShift'>Create Shift</Link><br/>
                <Link to='/Admin/ChangeShiftInfo'>Change Shift Info</Link><br/>
                <Link to='/Admin/DeleteShift'>Delete Shift</Link><br/>
                <Link to='/Admin/ViewShifts'>View Shifts</Link><br/>
            </div>
        </div>
    );
}

export default AdminMenu;