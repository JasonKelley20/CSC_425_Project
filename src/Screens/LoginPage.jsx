import React,{useEffect, useContext} from "react";
import { AuthContext } from "../Contexts/AuthContext";
import axios from "axios";
import {useNavigate, Link} from 'react-router-dom';

const LoginPage = () => {
    const {jwt, login, logout} = useContext(AuthContext);
    const API_PATH = 'http://localhost:5000/api/login';
    const navigate = useNavigate();

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
        document.getElementById('registerLink').addEventListener('click', ()=>{
            navigate('/Register');
        })
        */
    }, []);
    
    const loginMethod = async (event) => {
        event.preventDefault();
        const username = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;

        if(!username || !password){
            console.log('username or password needed');
            alert('Please input your username and password');
            return;
        }

        document.getElementById('usernameInput').value = '';
        document.getElementById('passwordInput').value = '';

        try{
            const response = await contactAPI(username, password);

            if(response.data.token){
                login(response.data.token);
                navigate('/LandingPage');
            } else {
                console.log('Token not provided');
            }
        } catch (error){
            console.error('Login Failed: ' + error.response?.data?.error || error.message);
            alert("Incorrect Username or Password. Please Try Again");
        }
    }

    const contactAPI = (username, password) => {
        return axios.post(API_PATH, {username, password});
    }

    return(
        <section className="gradient-custom">
        <div className="container-fluid py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card bg-dark text-white" style={{borderRadius: "1rem"}}>
                <div className="card-body p-5 text-center">
      
                  <div className="mb-md-5 mt-md-4 pb-5">
      
                    <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
                    <p className="text-white-50 mb-5">Please enter your login and password!</p>
      
                    <div data-mdb-input-init className="form-outline form-white mb-4">
                      <input type='text' id="usernameInput" className="form-control form-control-lg" required/>
                      <label className="form-label" htmlFor="usernameInput">Username</label>
                    </div>
      
                    <div data-mdb-input-init className="form-outline form-white mb-4">
                      <input type="password" id="passwordInput" className="form-control form-control-lg" required/>
                      <label className="form-label" htmlFor="passwordInput">Password</label>
                    </div>
            
                    <button data-mdb-button-init data-mdb-ripple-init className="btn btn-outline-light btn-lg px-5" type="submit" onClick={loginMethod}>Login</button>      
                  </div>
      
                  <div>
                    <p className="mb-0">Don't have an account? <Link to="/Register" className="text-white-50 fw-bold">Register</Link>
                    </p>
                  </div>
      
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
    /*<>
    <p>Login Page</p>
    <form onSubmit = {loginMethod}>

        <label htmlFor='usernameInput'>Username: </label>
        <input type='text' name='usernameInput' id='usernameInput' required/>
        <br/>
        <label htmlFor='passwordInput'>Password: </label>
        <input type='password' name='passwordInput' id='passwordInput' required/>
        <br/>
        <input type='submit' value='Login'/>
    </form>
    
    <h4 id='registerLink'>Don't have an account? Register</h4>
    </>
    */
    
    );
}


export default LoginPage;