import React, {createContext, useState, useEffect} from "react";

const AuthContext = createContext({jwt:null, login: ()=>{}, logout: ()=>{}});

const AuthProvider = ({children}) =>{

    const [jwt, setJwt] = useState(localStorage.getItem('jwt') || null);

    const login = (token) => {
        setJwt(token);
        localStorage.setItem('jwt', token);
    };

    const logout = () => {
        setJwt(null);
        localStorage.removeItem('jwt');
    };

    return (
        <AuthContext.Provider value={{jwt, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export {AuthContext, AuthProvider};