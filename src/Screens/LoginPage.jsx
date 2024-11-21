import React,{useEffect, useContext} from "react";
import { AuthContext } from "../Contexts/AuthContext";
import axios from "axios";
import {useNavigate} from 'react-router-dom';

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

        document.getElementById('registerLink').addEventListener('click', ()=>{
            navigate('/Register');
        })
    }, []);
    
    const loginMethod = async (event) => {
        event.preventDefault();
        const username = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;

        if(!username || !password){
            console.log('username or password needed');
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

    return(<>
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
    </>);
}


export default LoginPage;