import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Shifts = () => {
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/shifts')
      .then(response => {
        setShifts(response.data.data);
        console.log(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching Shifts:', error);
      });
  }, []);

  return (
    <div>
      <h1>Shifts List</h1>
      <ul>
        {shifts.map(shift => (
          <li key={shift.shiftID}>
            {shift.employeeFName} {shift.employeeLName}
            <br />
            {shift.shiftStartTime} - {shift.shiftEndTime}   |    {shift.clockInTime} | {shift.clockOutTime}
            <br />
            Team: {shift.teamName}
            <br/><br/>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Shifts;
