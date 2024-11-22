import React, {useState, useEffect, useContext} from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import axios from 'axios';


const AdminProtectedRoute = ({children}) => {
    const {jwt, login, logout} = useContext(AuthContext);
    const [isVerified, setIsVerified] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    const VERIFY_ENDPOINT = 'http://localhost:5000/api/verifyUser';


    useEffect(()=>{
        const verifyToken = async () =>{
            if(!jwt){
                setIsVerified(false);
                setIsAdmin(false);
                return;
            }

            try{
                const response = await axios.post(VERIFY_ENDPOINT, {token : jwt});
                setIsVerified(response.data.valid);
                setIsAdmin(response.data.user.role === 'Admin');
            } catch(err) {
                console.error('Token verification failed: ' + err.message);
                setIsVerified(false);
                setIsAdmin(false);
                logout();
            }
        };

        verifyToken();
    }, [jwt, logout]);


    if(isVerified == null || isAdmin == null) {
        //would like too eventually add an actual spinner here or something, but i need to get some other stuff done first.
        return <p>Loading . . .</p>;
    } else if(isVerified == true && isAdmin == true){
        return children;
    } else if(isVerified == true) {
        return <Navigate to='/LandingPage' />; //useNavigate creates errors. Apparently Navigate should be used with conditional rendering instead
    } else {
        return <Navigate to='/Login'/>
    }
}


export default AdminProtectedRoute;