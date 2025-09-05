import jwt from 'jsonwebtoken';

const PRIVATE_KEY = process.env.PRIVATE_KEY;

export const generateAccessToken = (user) => jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '30m' });

export const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user.id, username: user.username, type: 'refresh' }, PRIVATE_KEY, { expiresIn: '1d' });
};

export const validateRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, PRIVATE_KEY);
        if (decoded.type === 'refresh') {
            return decoded;
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const generateJWT = (user) => generateAccessToken(user);