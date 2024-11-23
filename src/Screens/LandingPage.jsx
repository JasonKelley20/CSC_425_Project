import React from "react";
import axios from "axios";
import MyShiftsCalendar  from '../Components/MyShiftsCalendar.jsx';

const LandingPage = () => {

    return(<div className="card">
    
    <h1>Welcome</h1>
        <br/>
        <MyShiftsCalendar />
    </div>);
}


export default LandingPage;