import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";

const UpdateEmployeeRecord = () => {
    //args: body{employeeFName, employeeLName}
    //admin auth required.
    const {jwt, login, logout} = useContext(AuthContext);
    const API_ENDPOINT = '/api/employees';
    

    const updateEmployeeRecordFunction = async () => {
        const employeeID = document.getElementById('employeeIDInput').value;
        const newFName = document.getElementById('newFNameInput').value;
        const newLName = document.getElementById('newLNameInput').value;

        if(!employeeID || employeeID == ''){
            alert('EmployeeID is required');
            return;
        }
        if((!newFName || newFName==='') && (!newLName || newLName === '')){
            alert('At least one field must change about the employee to submit. Enter a new First Name or a new Last Name');
            return;
        }


        try{
            const API_ENDPOINT_COMPLETE = API_ENDPOINT+`/${employeeID}`;
            const data = {}
            if(newFName !== null && newFName!=='') {
                data.employeeFName = newFName;
            }
            if(newLName !== null && newLName!==''){
                data.employeeLName = newLName;
            }

            const response = await axios.put(API_ENDPOINT_COMPLETE, data, 
                { 
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                }
            );

            if(response.status === 200){
                alert('Employee Updated Successfully.');
                document.getElementById('employeeIDInput').value = '';
                document.getElementById('newFNameInput').value = '';
                document.getElementById('newLNameInput').value = '';
            }
        } catch(err) {
            if(err.response?.data?.error.includes("Employee not found or no change in data")){
                alert("Employee not found or no change in data");
                return;
            }
            alert("Employee Update FAILED. Please check that your information is correct.");
        }
    }

    return(
        <div className="registration-form" onSubmit={(event)=>event.preventDefault()}>
        <form>
            <h2 className="FormHeader">Update An Employee's Employee Record</h2>
            <br />
            <div className="form-icon">
                <span><i className="icon icon-user"></i></span>
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="employeeIDInput" placeholder="EmployeeID" />   
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="newFNameInput" placeholder="New First Name OR Leave Blank" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="newLNameInput" placeholder="New Last Name OR Leave Blank" />
            </div>
            <div className="form-group">
                <button type="button" className="btn btn-block create-account" onClick={updateEmployeeRecordFunction}>Update Employee Account</button>
            </div>
        </form>
    </div>
    );
}

export default UpdateEmployeeRecord;