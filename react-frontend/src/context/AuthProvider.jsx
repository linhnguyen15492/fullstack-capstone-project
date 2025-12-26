import React, { useState } from "react";
import { useAuthContext } from './AuthContext'


const AuthProvider = ({ children }) => {
    const [AuthContext] = useAuthContext();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");

    return (
        <AuthContext.Provider
            value={{ isLoggedIn, setIsLoggedIn, userName, setUserName }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;