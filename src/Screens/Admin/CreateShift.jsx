import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";

const CreateShift = () => {
    const {jwt, login, logout} = useContext(AuthContext);
    const API_ENDPOINT = 'http://localhost:5000/api/createShift';
    
    const testDateFormat = (dateToTest) => {
        try{
            const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/; //used for making sure inputted dates are in the correct format.
            if(regex.test(dateToTest)){
                
                const parsedDate = Date.parse(dateToTest.replace(' ', 'T')); //convert to ISO format and check for errors
                return !isNaN(parsedDate);
                //return (!isNaN(new Date(dateToTest).getTime()));
            } else {
                return false;
            }
        } catch(err) {
            return false;
        }
    }

    const createShift = async () => {
        const employeeID = document.getElementById('employeeIDInput').value;
        const startTime = document.getElementById("startInput").value;
        const endTime = document.getElementById("endInput").value;
        const clockInTime = document.getElementById("clockInInput").value;
        const clockOutTime = document.getElementById("clockOutInput").value;
        const teamID = document.getElementById("teamIDInput").value;
        
        if(!employeeID){
            alert('EmployeeID required');
            return;
        }
        if((startTime!=='' && !testDateFormat(startTime)) || (endTime!=='' && !testDateFormat(endTime)) || (clockInTime!=='' && !testDateFormat(clockInTime)) || (clockOutTime!=='' && !testDateFormat(clockOutTime))){
            alert('One or more of the inputed date(s) is not in the correct format or is not a real time.');
            return;
        }

        let data = {};
        data.employeeID = employeeID;

        if(startTime !== null && startTime !== ''){
            data.shiftStartTime = startTime;
        }
        if(endTime !== null && endTime !== ''){
            data.shiftEndTime = endTime;
        }
        if(clockInTime !== null && clockInTime !== ''){
            data.clockInTime = clockInTime;
        }
        if(clockOutTime !== null && clockOutTime !== ''){
            data.clockOutTime = clockOutTime;
        }
        if(teamID !== null && teamID !== ''){
            data.teamID = teamID;
        }


        try{
            const response = await axios.post(API_ENDPOINT, data, 
            { 
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }
            ); 

            if(response.status === 200) {
                alert('Shift Created and Assigned');
                document.getElementById('employeeIDInput').value = '';
                document.getElementById("startInput").value = '';
                document.getElementById("endInput").value = '';
                document.getElementById("clockInInput").value = '';
                document.getElementById("clockOutInput").value = '';
                document.getElementById("teamIDInput").value = '';
            }
        } catch(err) {
            alert('Shift Could Not Be Created.');
            console.error(err);
        }
        
    }

    return(
        <div className="registration-form" onSubmit={(event)=>event.preventDefault()}>
        <form>
            <h2 className="FormHeader">Create A New Shift</h2>
            <h5 className="FormHeader">Enter Times As 'YYYY-MM-DD HH:MM:SS'</h5>
            <br />
            <div className="form-icon">
                <span><i className="icon icon-user"></i></span>
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="employeeIDInput" placeholder="employeeID" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="startInput" placeholder="Shift Start Time" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="endInput" placeholder="Shift End Time" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="clockInInput" placeholder="Clock In Time Or Leave Blank" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="clockOutInput" placeholder="Clock Out Time Or Leave Blank  " />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="teamIDInput" placeholder="TeamID or leave Blank" />
            </div>
            <div className="form-group">
                <button type="button" className="btn btn-block create-account" onClick={createShift}>Create Shift</button>
            </div>
        </form>
    </div>
    );
}

export default CreateShift;