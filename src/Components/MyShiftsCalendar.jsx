import React, {useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext} from "../Contexts/AuthContext";
//import './css/CalendarStyles.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
//import 'bootstrap/dist/css/bootstrap.min.css';

const MyShiftsCalendar = () => {
    //Uses open source software found at https://fullcalendar.io/docs/react
    const {jwt, login, logout} = useContext(AuthContext);
    
    const [events, setEvents] = useState([]);

    const formatShiftDay = (shiftTime) => {
        const date = new Date(shiftTime );
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); //zero-indexed. also need padding for calendar i think
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    const formatShiftTimes = (shiftStartTime, shiftEndTime) => {
        const startDate = new Date(shiftStartTime );
        const endDate = new Date(shiftEndTime );

        const startHours = String(startDate.getHours()).padStart(2, '0');
        const endHours = String(endDate.getHours()).padStart(2, '0');
        const startMinutes = String(startDate.getMinutes()).padStart(2, '0');
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0');

        return `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
    }

    const getEvents = async () => {
        const API_PATH = 'http://localhost:5000/api/my_shifts';
        try{
            const response = await axios.get(API_PATH, {
                headers:{
                    Authorization: `Bearer ${jwt}`
                }
            })
            const fetchedEvents = response.data.data.map((shift) => ({
                title: `${formatShiftTimes(shift.shiftStartTime, shift.shiftEndTime)}`, 
                date: formatShiftDay(shift.shiftStartTime),
                extendedProps: {
                    shiftId : shift.shiftID,
                    shiftStartTime : shift.shiftStartTime,
                    shiftEndTime : shift.shiftEndTime, 
                    clockInTime : shift.clockInTime,
                    clockOutTime : shift.clockOutTime,
                    team: shift.teamName
                }
            }));

            setEvents(fetchedEvents);
        } catch(error) {
            console.error("Error fetching my shifts: " + error.response?.data || error.message);
        }
    }


    const handleClickOnShift = (info) => {
        const event = info.event;
        const {title, start, end, extendedProps} = event;

        let clockInTime = (String(new Date(extendedProps?.clockInTime).getHours()).padStart(2, '0') + ':' + String(new Date(extendedProps?.clockInTime).getMinutes()).padStart(2, '0')) || 'N/A';
        if(clockInTime == 'NaN:NaN'){
            clockInTime = 'N/A';
        }

        let clockOutTime = (new Date(extendedProps?.clockOutTime).getTime()) || 'N/A';
        if(clockOutTime == 'NaN:NaN'){
            clockOutTime = 'N/A';
        }

        alert(
            `The selected shift is on ${start}. 
            Shift Time: ${title}
            Start Date: ${ ((new Date(extendedProps?.shiftStartTime).getMonth()+1) + "/" + (new Date(extendedProps?.shiftStartTime).getDate())) || 'Unknown'}
            End Date: ${  ((new Date(extendedProps?.shiftEndTime).getMonth()+1) + "/" + (new Date(extendedProps?.shiftEndTime).getDate())) || 'Unknown'}
            Clock In: ${ clockInTime }
            Clock Out: ${ clockOutTime }
            Team : ${extendedProps?.teamName || 'N/A'}
            ShiftID : ${extendedProps?.shiftId || 'Unknown'}
            `
        );
    }

    useEffect(()=>{
        if(jwt){
            getEvents();
        }
    }, [jwt])

    return(<div id='container' style={{width:"1000px"}}><FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView = 'dayGridMonth' timeZone="local" events={events} eventClick={handleClickOnShift}/></div>)

}

export default MyShiftsCalendar;
