import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";

const ChangeShiftInfo = () => {
    //Admin only access to Update a shift. Only available from this page.
    //args: body{shiftStartTime, shiftEndTime, clockInTime, clockOutTime}
    //also, need to append shiftID to the endpoint URI ex. 'api/shifts/1'. Why i did this i don't remember, but it's there
    //Admin Auth needed

    //This Bootstrap Template was found at: https://epicbootstrap.com/snippets/registration
    const {jwt, login, logout} = useContext(AuthContext);
    const API_ENDPOINT = 'http://localhost:5000/api/shifts';   

    const changeShiftInfo = async () => {
        const shiftID = document.getElementById("shiftIDInput").value;
        const startTime = document.getElementById("startInput").value;
        const endTime = document.getElementById("endInput").value;
        const clockInTime = document.getElementById("clockInInput").value;
        const clockOutTime = document.getElementById("clockOutInput").value;

        if(!shiftID){
            alert('Shift ID Required.')
            return;
        }
        if(startTime==='' && endTime==='' && clockInTime==='' && clockOutTime===''){
            alert('Shift Start Time, Shift End Time, Clock In Time, OR Clock Out Time Needed to Change the shift.');
            return;
        }

        if((startTime!=='' && !testDateFormat(startTime)) || (endTime!=='' && !testDateFormat(endTime)) || (clockInTime!=='' && !testDateFormat(clockInTime)) || (clockOutTime!=='' && !testDateFormat(clockOutTime))){
            alert('One or more fields that have inputs do not have dates in the correct format.');
            return;
        }

        
        if(startTime!=='' && isNaN(new Date(startTime).getTime()) || endTime!=='' && isNaN(new Date(endTime).getTime()) || clockInTime!=='' && isNaN(new Date(clockInTime).getTime()) || clockOutTime!=='' && isNaN(new Date(clockOutTime).getTime())){
            alert('One or more of the inputs is not a real time.');
            return;
        }
        
        const ENDPOINT = API_ENDPOINT+`/${shiftID}`
        const data = {}
        if(startTime !== null && startTime!=='') {
            data.shiftStartTime = startTime;
        }
        if(endTime !== null && endTime!==''){
            data.shiftEndTime = endTime;
        }
        if(clockInTime !== null && clockInTime!==''){
            data.clockInTime = clockInTime;
        }
        if(clockOutTime !== null && clockOutTime!==''){
            data.clockOutTime = clockOutTime;
        }

        
        try{
            const response = await axios.put(ENDPOINT, data,
            { 
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }
            );

            if(response.status === 200){
                alert('Shift Updated');
                document.getElementById("shiftIDInput").value = '';
                document.getElementById("startInput").value = '';
                document.getElementById("endInput").value = '';
                document.getElementById("clockInInput").value = '';
                document.getElementById("clockOutInput").value = '';
            }

        } catch (err) {
            console.error(err.message);
            alert('Shift Update Failed');
        }
    }

    const testDateFormat = (dateToTest) => {
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/; //used for making sure inputted dates are in the correct format.
        return regex.test(dateToTest);
    }


    return(
    <div className="registration-form" onSubmit={(event)=>event.preventDefault()}>
        <form>
            <h2 className="FormHeader">Change Information About A Shift.</h2>
            <h5 className="FormHeader">Enter Times As 'YYYY-MM-DD HH:MM:SS'</h5>
            <br />
            <div className="form-icon">
                <span><i className="icon icon-user"></i></span>
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="shiftIDInput" placeholder="Shift ID of shift to be changed" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="startInput" placeholder="New Shift Start Time Or Leave Blank" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="endInput" placeholder="New Shift End Time Or Leave Blank" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="clockInInput" placeholder="Clock In Time Or Leave Blank" />
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="clockOutInput" placeholder="Clock Out Time Or Leave Blank  " />
            </div>
            <div className="form-group">
                <button type="button" className="btn btn-block create-account" onClick={changeShiftInfo}>Change Shift Info</button>
            </div>
        </form>
    </div>
);
}

export default ChangeShiftInfo;