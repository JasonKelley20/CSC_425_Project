import React, {useState, useEffect, useContext} from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import axios from 'axios';


const ProtectedRoute = ({children}) => {
    const {jwt, login, logout} = useContext(AuthContext);
    const [isVerified, setIsVerified] = useState(null);
    const VERIFY_ENDPOINT = 'http://localhost:5000/api/verifyUser';


    useEffect(()=>{
        const verifyToken = async () =>{
            if(!jwt){
                setIsVerified(false);
                return;
            }

            try{
                const response = await axios.post(VERIFY_ENDPOINT, {token : jwt});
                setIsVerified(response.data.valid)

            } catch(err) {
                console.error('Token verification failed: ' + err.message);
                setIsVerified(false);
                logout();
            }
        };

        verifyToken();
    }, [jwt, logout]);


    if(isVerified === null) {
        //would like too eventually add an actual spinner here or something, but i need to get some other stuff done first.
        return <p>Loading . . .</p>;
    }


    return isVerified ? children : <Navigate to = '/Login'/>;
}


export default ProtectedRoute;