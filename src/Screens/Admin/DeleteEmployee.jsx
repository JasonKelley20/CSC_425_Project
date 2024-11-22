import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";

const DeleteEmployee = () => {
    const {jwt, login, logout} = useContext(AuthContext);
    const API_ENDPOINT = 'http://localhost:5000/api/deleteEmployee';

    const deleteEmployeeFunction = async () => {
        const employeeID = document.getElementById('employeeIDInput').value;

        if(!employeeID || employeeID == ''){
            alert('Employee ID Required to delete employee');
            return;
        }
        try{
            //Axios DELETE requests are configured slightly differently than the others because DELETE 
            //requests usually do not expect information in a body element. The data is usually appended in a query in the URL
            //The API was already build however, so I chose to just send it this way for simplicity. (I'm also running out of time for the frontend to be built).
            const response = await axios.delete(API_ENDPOINT, 
                {
                    data: {employeeID: employeeID},
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                }
            );

            if(response.status === 200){
                alert('Employee Deleted Successfully');
                
                document.getElementById('employeeIDInput').value = '';
            }
        } catch(err) {
            if(err.response?.data?.error.includes("Employee not found or no change in data")){
                alert("Employee not found or no change in data");
                console.error(err.response.data.error);
                return;
            }
            alert('Could Not Delete Employee. Check that EmployeeID is correct, then try again.');
            console.error(err.message);
        }
    }

    return(
        <div className="registration-form" onSubmit={(event)=>event.preventDefault()}>
        <form>
            <h2 className="FormHeader">Delete An Employee</h2>
            <br />
            <div className="form-icon">
                <span><i className="icon icon-user"></i></span>
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="employeeIDInput" placeholder="employeeID" />
            </div>
            <div className="form-group">
                <button type="button" className="btn btn-block create-account" onClick={deleteEmployeeFunction}>Delete Employee</button>
            </div>
        </form>
    </div>
    );
}

export default DeleteEmployee;