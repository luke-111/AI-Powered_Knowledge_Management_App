import { useState, useEffect } from 'react';
import { useAuth } from "../components/auth/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import { sessionsAPI } from '../services/api';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [errorResponse, setErrorResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const location = useLocation();
    
    const stateMessage = location.state?.message;

    useEffect(() => {        
        if (stateMessage) {
            setErrorResponse(stateMessage);
            setError(true);
        }
    }, [stateMessage]);

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        setError(false);
        setErrorResponse("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError(false);
        setErrorResponse("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (username === '' || password === '') {
            setError(true);
            setErrorResponse("Fill in all fields.");
            return;
        }

        setError(false);
        setIsLoading(true);
    
        try {
            const response = await sessionsAPI.login({
                username: username,
                password: password,
            });

            if (response?.payload) {
                const { accessToken, user } = response.payload;
                login({ accessToken, user });
            }
        
        } catch (error) {
            setError(true);
            if (error.response?.status === 400 || error.response?.status === 401) {
                setErrorResponse("Wrong credentials. Try again.");
            } else if (error.response) {
                setErrorResponse(`Server internal error`);
            } else if (error.request) {
                setErrorResponse('No response from the server. Please check your internet connection.');
            } else {
                setErrorResponse('Error sending request. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthenticated) {
        return <Navigate to="/home" />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="flex items-center justify-center flex-1 py-8 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <div className="text-center mb-8">
                            <FaUser className="mx-auto h-12 w-12 text-ocedic mb-4" />
                            <h1 className="text-3xl font-bold text-ocedicDarker mb-2">
                                Login
                            </h1>
                            <p className="text-gray-600">
                                Enter your credentials
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {errorResponse && (
                                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
                                    <FaInfoCircle className="flex-shrink-0 mr-2 mt-0.5" />
                                    <span className="text-sm">{errorResponse}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 pl-10 pr-3 py-3 rounded-lg focus:ring-2 focus:ring-ocedic focus:border-ocedic transition-colors"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={handleUsernameChange}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full border border-gray-300 pl-10 pr-12 py-3 rounded-lg focus:ring-2 focus:ring-ocedic focus:border-ocedic transition-colors"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`w-full p-3 rounded-lg font-medium transition-all duration-200 border-2 border-ocedicDarker shadow-md focus:outline-none focus:ring-2 focus:ring-ocedicDarker focus:ring-offset-2
                                    ${isLoading
                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                        : 'bg-ocedic text-gray-600 hover:bg-ocedicDarker hover:shadow-lg transform hover:-translate-y-0.5'}
                                `}
                                disabled={isLoading}
                                style={{ minHeight: 48 }}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : (
                                    <span className="font-bold text-lg tracking-wide">Log in</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;