import React from "react";
import axios from "axios";
import MyShiftsCalendar  from '../Components/MyShiftsCalendar.jsx';

const LandingPage = () => {

    return(<div className="card">
    
    <h1>Landing Page</h1>
        <MyShiftsCalendar />
    </div>);
}


export default LandingPage;