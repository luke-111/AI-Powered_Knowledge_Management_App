import { useEffect, useRef } from "react";
import api from "../../services/api";
import { useAuth } from "./AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";

export const AxiosInstance = () => {
    const { handleTokenExpiration, getAccessToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const requestInterceptorRef = useRef(null);
    const responseInterceptorRef = useRef(null);
    
    useEffect(() => {
        requestInterceptorRef.current = api.interceptors.request.use(
            (config) => {
                const currentAccessToken = getAccessToken();
                if (currentAccessToken && !config.url?.includes('/refresh') && !config.url?.includes('/login')) {
                    config.headers.Authorization = `Bearer ${currentAccessToken}`;
                }
                
                if (!config.withCredentials && !config.url?.includes('http')) {
                    config.withCredentials = true;
                }
                
                return config;
            },
            (error) => Promise.reject(error)
        );
        
        responseInterceptorRef.current = api.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                const originalRequest = error.config;
                
                if (originalRequest._retry) {
                    return Promise.reject(error);
                }
                
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        await handleTokenExpiration();
                        
                        const newAccessToken = getAccessToken();
                        if (newAccessToken) {
                            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                            return api(originalRequest); 
                        }
                    } catch (refreshError) {
                        return Promise.reject(refreshError);
                    }
                }
                
                if (error.response) {
                    const status = error.response.status;
                    
                    switch (status) {
                        case 403:
                            if (location.pathname !== '/forbidden') {
                                navigate('/forbidden', { 
                                    replace: true,
                                    state: { 
                                        message: 'Denied access to this resource.' 
                                    }
                                });
                            }
                            break;
                        case 404:
                            if (location.pathname !== '/not-found') {
                                navigate('/not-found', { 
                                    replace: true,
                                    state: { 
                                        message: 'Resource not found.' 
                                    }
                                });
                            }
                            break;
                    }
                } else if (error.request) {
                    console.error('Network Error - No response from server:', error.message);
                } else {
                    console.error('Request Configuration Error:', error.message);
                }
                
                return Promise.reject(error);
            }
        );
        
        return () => {
            if (requestInterceptorRef.current !== null) {
                api.interceptors.request.eject(requestInterceptorRef.current);
            }
            if (responseInterceptorRef.current !== null) {
                api.interceptors.response.eject(responseInterceptorRef.current);
            }
        };
    }, [handleTokenExpiration, getAccessToken, navigate, location.pathname]);
    
    return null;
};