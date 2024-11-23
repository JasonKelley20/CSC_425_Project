import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";

const ViewShifts = () => {
    const {jwt, login, logout} = useContext(AuthContext);
    const API_ENDPOINT = 'http://localhost:5000/api/shifts';
    const [shifts, setShifts] = useState(null);

    const getShifts = async () => {
        const employeeID = document.getElementById('employeeIDInput').value;

        let API_ENDPOINT_FULL = API_ENDPOINT;
        
        if(employeeID && employeeID !== ''){
            API_ENDPOINT_FULL += `?employeeID=${employeeID}`;
        }
        

        try{
            const response = await axios.get(API_ENDPOINT_FULL,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                }
            );

            if(response.status === 200){
                setShifts(response.data.data); 
            }
        } catch(err) {
            console.error(err.message);
        }
    }


    const getShiftsForm = 
    (
        <div className="registration-form" onSubmit={(event)=>event.preventDefault()}>
        <form>
            <h2 className="FormHeader">View Shifts</h2>
            <br />
            <div className="form-icon">
                <span><i className="icon icon-user"></i></span>
            </div>
            <div className="form-group">
                <input type="text" className="form-control item" id="employeeIDInput" placeholder="Leave Blank OR Input employee ID to view shifts for that employee" />
            </div>
            <div className="form-group">
                <button type="button" className="btn btn-block create-account" onClick={getShifts}>View Shifts</button>
            </div>
        </form>
    </div>
    );

    const [display, setDisplay] = useState(getShiftsForm);

    useEffect(()=> {
        if(!shifts){
            setDisplay(getShiftsForm);
            return;
        }

        const shiftMapping = (<div className='card registration-form' style={{width:'60%', alignSelf:'center', backgroundColor:'var(--bs-gray-100)'}}>
            <h2 className="FormHeader" id="shiftMappingDiv">Shifts</h2>
            {shifts.map((shift)=>{
            return (<div className="card form-group" key={shift.shiftID} style={{marginTop:'30px', marginLeft:'30px', marginRight:'30px', backgroundColor:'var(--bs-gray-400)'}}>
                        <p>ShiftID: {shift.shiftID}</p>
                        <p>Shift Start Time: {shift.shiftStartTime}</p>
                        <p>Shift End Time: {shift.shiftEndTime}</p>
                        <p>Clock In Time: {shift.clockInTime}</p>
                        <p>Clock Out Time: {shift.clockOutTime}</p>
                        <p>Employee Name: {shift.employeeFName + " " + shift.employeeLName}</p>
                        <p>EmployeeID: {shift.employeeID}</p>
                        <p>TeamID: {shift.teamID}</p>
                        <p>Team Name: {shift.teamName}</p>
                    </div>)
            })}
            <button className = 'btn btn-block create-account btn-danger' onClick={() => setShifts(null)} style={{width:'30%', margin:'30px', alignSelf:'center', backgroundColor:'red'}}> Reset Form </button>
        </div>);

        setDisplay(shiftMapping);
    }, [jwt, shifts]);



    return(
        <>
            {display}
            
        </>
    );
}

export default ViewShifts;