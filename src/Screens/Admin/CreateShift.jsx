import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";

const CreateShift = () => {
    const {jwt, login, logout} = useContext(AuthContext);
    const API_ENDPOINT = '';

    useEffect(()=>{

    }, [jwt]);

    return('');
}

export default CreateShift;