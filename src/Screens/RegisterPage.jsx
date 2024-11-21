import React, {useEffect, useContext} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

        document.getElementById('loginLink').addEventListener('click', ()=>{
            navigate('/Login');
        })
    }, []);

    const Register = async (event) => {
        event.preventDefault();
        const username = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const firstName = document.getElementById('firstNameInput').value;
        const lastName = document.getElementById('lastNameInput').value;

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
        return axios.post(API_PATH, {username, password, role, firstName, lastName});
    }

    return(<>
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
    </>);
}


export default RegisterPage;