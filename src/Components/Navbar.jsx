import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import { AuthContext } from "../Contexts/AuthContext";
import { Link } from "react-router-dom";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const Navbar = () => {
    const {jwt, login, logout} = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const JWT_VERIFICATION_LINK = 'http://localhost:5000/api/verifyUser';

    const handleLogout = () => {
        logout();
    }

    //This uses a free bootstrap template found at https://getbootstrap.com/docs/4.3/components/navbar/
    const adminNavBar = (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link className="navbar-brand" to='/'>Home</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
                <ul className="navbar-nav">
                <li className="nav-item active">
                    <Link className="nav-link" to='/LandingPage'>My Schedule</Link>
                </li>
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Admin
                    </a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                        <Link className="dropdown-item" to='/Admin/AddUser'>Add User</Link>                    
                        <Link className="dropdown-item" to='/Admin/DeleteEmployee'>Delete Employee</Link>
                        <Link className="dropdown-item" to='/Admin/ViewEmployees'>View Employees</Link>
                        <Link className="dropdown-item" to='/Admin/UpdateEmployeeRecord'>Update Employee Record</Link>
                        <Link className="dropdown-item" to='/Admin/CreateShift'>Create Shift</Link>
                        <Link className="dropdown-item" to='/Admin/ChangeShiftInfo'>Change Shift Info</Link>
                        <Link className="dropdown-item" to='/Admin/DeleteShift'>Delete Shift</Link>
                        <Link className="dropdown-item" to='/Admin/ViewShifts'>View shifts</Link>
                    </div>
                </li>
                </ul>   
            </div>
            <button className="btn btn-outline-danger ml-auto" id="LogoutButton" onClick={handleLogout}>
                Logout
            </button>
        </nav>);

    
    const NavBar = (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link className="navbar-brand" to='/'>Home</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
                <ul className="navbar-nav">
                <li className="nav-item active">
                    <Link className="nav-link" to='/LandingPage'>My Schedule</Link>
                </li>
                </ul>   
            </div>
            <button className="btn btn-outline-danger ml-auto" id="LogoutButton" onClick={handleLogout}>
                Logout
            </button>
        </nav>);

    useEffect(()=>{
        const verifyUser = async() => {
            if(!jwt){
                setIsAdmin(false);
                return;
            }

            try{
                const response = await axios.post(JWT_VERIFICATION_LINK, {token : jwt});

                if(response.data.valid && (response.data.user.role==='admin' || response.data.user.role==='Admin')){
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch(err){
                console.error(err.message);
                console.error("Error verifying user:", err.message);
                setIsAdmin(false);
            }
        };



        verifyUser();
    }, [jwt]);

    return isAdmin? adminNavBar : NavBar;
    
}

export default Navbar;