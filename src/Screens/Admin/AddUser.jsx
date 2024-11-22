import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import './AdminCss.css';
import { AuthContext } from "../../Contexts/AuthContext";

const AddUser = () => {
    //Admin only access to create an employee account. May also register new account as Admin. Only available from this page.
    //args: body{username, password, employeeFName, employeeLName, role}
    //Admin Auth needed

    //This Bootstrap Template was found at: https://epicbootstrap.com/snippets/registration
    const {jwt, login, logout} = useContext(AuthContext);
    const API_ENDPOINT='http://localhost:5000/api/register';



    const addUser = async () => {
        const username = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const employeeFName = document.getElementById('employeeFNameInput').value;
        const employeeLName = document.getElementById('employeeLNameInput').value;
        const role = document.getElementById('roleInput').value;

        //verify neccessary Information
        if(!username || !password || !passwordConfirm || !employeeFName || !employeeLName || !role){
            alert('All fields needed for this form.')
            return;
        }
        if(password !== passwordConfirm){
            alert('Passwords do not match');
            return;
        }
        //contact API
        try{
            const response = await axios.post(API_ENDPOINT, 
                {
                username: username,
                password: password,
                employeeFName: employeeFName,
                employeeLName: employeeLName,
                role: role
                }, {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                }
            );

            if(response.status === 200){
                alert('User registered successfully');
            }

            document.getElementById('usernameInput').value = '';
            document.getElementById('passwordInput').value = '';
            document.getElementById('passwordConfirm').value = '';
            document.getElementById('employeeFNameInput').value = '';
            document.getElementById('employeeLNameInput').value = '';
        } catch (err) {
            if(err.response?.data?.error?.includes("Username already exists.")){
                alert('Username Already Exists');
            } else {
                alert('Registration Failed. Please Try Again in a few minutes.');
                console.error(err.response?.data?.error || err.message);
            }
            
        }
    }

    return(
    <div className="registration-form" onSubmit={(event)=>event.preventDefault()}>
        <form>
            <h2 className="FormHeader">Register an account for a new employee or admin</h2>
            <br />
            <div className="form-icon">
                <span><i className="icon icon-user"></i></span>
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="usernameInput" placeholder="New Employee Username" />
            </div>
            <div className="form-group">
                <input type="password" className="form-control item" id="passwordInput" placeholder="New Employee Password" />
            </div>
            <div className="form-group">
                <input type="password" className="form-control item" id="passwordConfirm" placeholder="Confirm Password" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="employeeFNameInput" placeholder="Employee's First Name" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="employeeLNameInput" placeholder="Employee's Last Name" />
            </div>
            <div className="form-group">
                <label>
                    What Role should the new account have? <br/>
                    <select id='roleInput'>
                        <option value = "User">User</option>
                        <option value = "Admin">Admin</option>
                    </select>
                </label>
            </div>
            <div className="form-group">
                <button type="button" className="btn btn-block create-account" onClick={addUser}>Create Employee Account</button>
            </div>
        </form>
    </div>
    );
}

export default AddUser;