import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";

const ViewEmployees = () => {
    const {jwt, login, logout} = useContext(AuthContext);
    const API_ENDPOINT = 'http://localhost:5000/api/employees';
    const [employees, setEmployees] = useState(null);

    const getEmployees = async () => {
        
        try{
            const response = await axios.get(API_ENDPOINT,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                }
            );

            if(response.status === 200){
                setEmployees(response.data.data); 
                console.log('request successful'); 
                console.log(response.data.data); 
            }
        } catch(err) {
            console.error(err.message);
        }
    }

    const getEmployeesForm = 
    (
        <div className="registration-form" onSubmit={(event)=>event.preventDefault()}>
        <form>
            <h2 className="FormHeader">View Employee Records</h2>
            <br />
            <div className="form-icon">
                <span><i className="icon icon-user"></i></span>
            </div>
            <div className="form-group">
                <button type="button" className="btn btn-block create-account" onClick={getEmployees}>View Employees</button>
            </div>
        </form>
    </div>
    );

    const [display, setDisplay] = useState(getEmployeesForm);


    useEffect(()=> {
        if(!employees){
            setDisplay(getEmployeesForm);
            return;
        }

        const employeeMapping = (<div className='card registration-form' style={{width:'60%', alignSelf:'center', backgroundColor:'var(--bs-gray-100)'}}>
            <h2 className="FormHeader">Employee Records</h2>
            {employees.map((employee)=>{
            return (<div className="card form-group" key={employee.id} style={{marginTop:'30px', marginLeft:'30px', marginRight:'30px', backgroundColor:'var(--bs-gray-400)'}}>
                        <p>EmployeeID: {employee.id}</p>
                        <p>Employee Name: {employee.employeeFName + ' ' + employee.employeeLName}</p>
                    </div>)
            })}
            <button className = 'btn btn-block create-account btn-danger' onClick={() => setEmployees(null)} style={{width:'30%', margin:'30px', alignSelf:'center', backgroundColor:'red'}}> Reset Form </button>
        </div>);

        setDisplay(employeeMapping);
    }, [jwt, employees]);

    return(
        <>
            {display}
        </>
    );
}

export default ViewEmployees;