import { generateAccessToken, generateRefreshToken, validateRefreshToken } from '../middlewares/jwt.middleware.js';
import { usersService } from '../services/users.service.js';

async function handleTokens(res, user) {
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    });
    
    return {
        accessToken: newAccessToken,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
        },
        expiresIn: 30 * 60 // 30 minutos 
    };
}

class SessionsController {
    async signup(req, res) {
        res.sendOk(req.user);
    }

    async login(req, res) {
        try {
            const user = req.user;

            const result = await handleTokens(res, user);

            res.sendOk(result);
        } catch (error) {
            req.logger.error(`Error while logging in user ${req.user.username}: ${error.message}`);
            res.sendInternalServerError(error.message);
        }
    }

    async refresh(req, res) {
        try {
            const { refreshToken } = req.cookies;
            
            if (!refreshToken) {
                return res.sendUnauthorizedError('Refresh token not provided');
            }
            
            const decoded = validateRefreshToken(refreshToken);
            
            if (!decoded || !decoded.userId) {
                return res.sendUnauthorizedError('Invalid or expired refresh token');
            }
            
            const user = await usersService.getById(decoded.userId);
            
            if (!user) {
                return res.sendUnauthorizedError('User not found');
            }
            
            const result = await handleTokens(res, user);

            res.sendOk(result);
        } catch (error) {
            req.logger.error(`Error refreshing token: ${error.message}`);
            res.sendInternalServerError('Error refreshing token');
        }
    }

    async logout(req, res) {
        try {
            res.clearCookie('refreshToken');
            res.sendOk();
        } catch (error) {
            req.logger.error(`Error during logout: ${error.message}`);
            res.clearCookie('refreshToken');
            res.sendOk();
        }
    }
}

export const sessionsController = new SessionsController();