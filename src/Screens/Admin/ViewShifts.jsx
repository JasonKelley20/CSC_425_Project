import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";

const ViewShifts = () => {
    const {jwt, login, logout} = useContext(AuthContext);
    const API_ENDPOINT = '';

    

    return('');
}

export default ViewShifts;