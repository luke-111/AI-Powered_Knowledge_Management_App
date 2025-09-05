import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const ProtectedRouteRoles = ({ roles = [] }) => {
    const auth = useAuth();
    const userRole = auth.getUser()?.role ? auth.getUser().role : null;

    return roles.includes(userRole) ? <Outlet /> : <Navigate to="/not-found"/>;
};

export default ProtectedRouteRoles;