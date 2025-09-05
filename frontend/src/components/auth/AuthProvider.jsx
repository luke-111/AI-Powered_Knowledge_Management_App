import { useContext, createContext, useState, useEffect, useCallback, useRef } from "react";
import api, { sessionsAPI } from "../../services/api";


const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    login: (_loginData) => {},
    logout: () => {},
    refreshToken: () => {},
    isLoading: false,
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const isRefreshingRef = useRef(false);
    const refreshPromiseRef = useRef(null);

    const clearSession = useCallback(() => {
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        
        isRefreshingRef.current = false;
        refreshPromiseRef.current = null;
    }, []);

    const refreshAccessToken = useCallback(async () => {
        if (isRefreshingRef.current && refreshPromiseRef.current) {
            return refreshPromiseRef.current;
        }
        
        isRefreshingRef.current = true;
        
        refreshPromiseRef.current = (async () => {
            try {
                const response = await sessionsAPI.refresh();
                if (response?.payload) {
                    const { accessToken: newAccessToken, user: userData } = response.payload;
                    setAccessToken(newAccessToken);
                    setUser(userData);
                    setIsAuthenticated(true);
                    return newAccessToken;
                }
                throw new Error('Invalid refresh response');
            } catch (error) {
                clearSession();
                throw error;
            } finally {
                isRefreshingRef.current = false;
                refreshPromiseRef.current = null;
            }
        })();
        
        return refreshPromiseRef.current;
    }, [accessToken, clearSession]);
    
    const checkAuthStatus = useCallback(async () => {
        try {
            const newAccessToken = await refreshAccessToken();
            return !!newAccessToken;
        } catch (error) {
            return false;
        }
    }, [refreshAccessToken]);
    
    const login = useCallback((loginData) => {
        const { accessToken: newAccessToken, user: userData } = loginData;
        
        setAccessToken(newAccessToken);
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
    }, []);
    
    const logout = useCallback(async () => {
        setIsLoading(true);
        
        try {
            if (accessToken) {
                await api.post('/sessions/logout', {}, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    withCredentials: true,
                    timeout: 5000
                });
            }
        } catch (error) {
        } finally {
            clearSession();
        }
    }, [accessToken, clearSession]);
    
    const handleTokenExpiration = useCallback(async () => {
        try {
            await refreshAccessToken();
        } catch (error) {
            clearSession();
        }
    }, [refreshAccessToken, clearSession]);
    
    const getUser = useCallback(() => {
        return user;
    }, [user]);
    
    const getAccessToken = useCallback(() => {
        return accessToken;
    }, [accessToken]);

    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            await checkAuthStatus();
            setIsLoading(false);
        };
        
        initializeAuth();
    }, [checkAuthStatus]);
    
    const contextValue = {
        isAuthenticated,
        user,
        accessToken,
        login,
        logout,
        refreshToken: refreshAccessToken,
        handleTokenExpiration,
        isLoading,
        getUser,
        getAccessToken
    };
    
    return (
        <AuthContext.Provider value={contextValue}>
            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Verifying auth...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used in a AuthProvider');
    }
    return context;
};