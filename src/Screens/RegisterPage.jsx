import React, {useEffect, useContext} from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";

const RegisterPage = () => {
    const API_PATH = 'http://localhost:5000/api/register';
    const navigate = useNavigate();
    const {jwt, login} = useContext(AuthContext);

    useEffect(()=>{
        //if the user is already logged in, take them to the landing page instead
        if(jwt){
            const API_VERIFY_PATH = 'http://localhost:5000/api/verifyUser';
            axios.post(API_VERIFY_PATH, {token : jwt})
            .then(response => {
                if(response?.data?.valid == true){
                    navigate('/LandingPage');
                }
            })
            .catch(error => {
                //nothing here
            });
        }

        /*
        document.getElementById('loginLink').addEventListener('click', ()=>{
            navigate('/Login');
        })
        */
    }, []);

    const Register = async (event) => {
        event.preventDefault();
        const username = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const firstName = document.getElementById('firstNameInput').value;
        const lastName = document.getElementById('lastNameInput').value;

        if(!password || !passwordConfirm || !username || !firstName || !lastName){
            alert('All fields required.');
            return;
        }
        
        if(password !== passwordConfirm){
            console.error('password and password confirmation do not match');
            alert('Your password and password confirmation do not match.')
            return;
        }

        try{
            const response = await contactAPI(username, password, firstName, lastName);
            if(response.data.message.includes('registered successfully')){
                
                const loginRequest = await axios.post('http://localhost:5000/api/login', {username, password});
                
                if(loginRequest.data.token){
                    login(loginRequest.data.token);
                    navigate('/LandingPage');
                }
            }
        } catch (error){
            console.error('Account Registration Failed: ' +  error.message);
            if(error.response?.data?.error?.includes("Username already exists")){
                alert("Username already exists");
            } else {
                alert("Registration Failed. Please try again");
            }
        }
        document.getElementById('usernameInput').value = '';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordConfirm').value = '';
        document.getElementById('firstNameInput').value = '';
        document.getElementById('lastNameInput').value = '';
    }

    const contactAPI = (username, password, firstName, lastName) => {
        const role = 'User';
        return axios.post(API_PATH, {username, password, role, employeeFName: firstName, employeeLName: lastName});
    }

    return(
    
        <section className="gradient-custom">
        <div className="container-fluid py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card bg-dark text-white" style={{borderRadius: "1rem"}}>
                <div className="card-body p-5 text-center">
      
                  <div className="mb-md-5 mt-md-4 pb-5">
      
                    <h2 className="fw-bold mb-2 text-uppercase">Register Account</h2>
                    <p className="text-white-50 mb-5">Please enter your credentials</p>
      
                    <div data-mdb-input-init className="form-outline form-white mb-4">
                      <input type='text' id="usernameInput" className="form-control form-control-lg" required/>
                      <label className="form-label" htmlFor="usernameInput">Username</label>
                    </div>
      
                    <div data-mdb-input-init className="form-outline form-white mb-4">
                      <input type="password" id="passwordInput" className="form-control form-control-lg" required/>
                      <label className="form-label" htmlFor="passwordInput">Password</label>
                    </div>

                    <div data-mdb-input-init className="form-outline form-white mb-4">
                      <input type="password" id="passwordConfirm" className="form-control form-control-lg" required/>
                      <label className="form-label" htmlFor="passwordConfirm">Confirm Password</label>
                    </div>

                    <div data-mdb-input-init className="form-outline form-white mb-4">
                      <input type='text' id="firstNameInput" className="form-control form-control-lg" required/>
                      <label className="form-label" htmlFor="firstNameInput">First Name</label>
                    </div>

                    <div data-mdb-input-init className="form-outline form-white mb-4">
                      <input type='text' id="lastNameInput" className="form-control form-control-lg" required/>
                      <label className="form-label" htmlFor="lastNameInput">Last Name</label>
                    </div>
                    <button data-mdb-button-init data-mdb-ripple-init className="btn btn-outline-light btn-lg px-5" type="submit" onClick={Register}>Register</button>      
                  </div>
      
                  <div>
                    <p className="mb-0">Already have an account? <Link to="/Login" className="text-white-50 fw-bold">Login</Link>
                    </p>
                  </div>
      
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
    /*<>
    <p>Register Page</p>
    <form onSubmit = {Register}>

        <label htmlFor='usernameInput'>Username: </label>
        <input type='text' name='usernameInput' id='usernameInput' required/>
        <br/>
        <label htmlFor='passwordInput'>Password: </label>
        <input type='password' name='passwordInput' id='passwordInput' required/>
        <br/>
        <label htmlFor='passwordConfirm'>Confirm Password: </label>
        <input type='password' name='passwordConfirm' id='passwordConfirm' required/>
        <br/>

        <label htmlFor='firstNameInput'>First Name: </label>
        <input type='text' name='firstNameInput' id='firstNameInput' required/>
        
        <label htmlFor='lastNameInput'>Last Name: </label>
        <input type='text' name='lastNameInput' id='lastNameInput' required/>
        <br/>


        <input type='submit' value='Register Account'/>
    </form>
    
    <h4 id='loginLink'>Already have an account? Login</h4>
    </>
    
    
    */);
}


export default RegisterPage;