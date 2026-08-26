import apiClinet from './apiClient.js'


// Register
export const register = (payload) => {
    return apiClinet.post( "" , payload)
}

// Login
export const login = (payload) => {
    return apiClinet.post( "" , payload)
}

// Logout
export const logout = () => {
    return apiClinet.post( "")
}


