import passport from 'passport';
import local from 'passport-local'
import jwt from "passport-jwt"
import { usersService } from '../services/users.service.js';

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const accessTokenExtractor = req => {
	let token = null;
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.substring(7);
	}
	return token;
}

export const initializePassport = () => {
    passport.use('signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
    }, async (req, username, password, done) => {

        try {
            const user = await usersService.getByUsername(username);
            if (user) {
                return done(null, false, { message: 'User with specified username already exists' });
            }

        } catch (error) {
            return done(error);
        }

        try {
            const user = await usersService.create({ username, role: "USER", password });
            user.password = undefined;
            return done(null, user);
        } catch (error) {
            done(error);
        }
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, async (username, password, done) => {
        try {
            let user = await usersService.getByUsername(username);

            if (!user) {
                return done(null, false, { message: 'Wrong credentials.' });
            }

            const validate = await user.validatePassword(password);
            if (!validate) {
                return done(null, false, { message: `Wrong credentials.` });
            }

            user.password = undefined;

            return done(null, user, { message: 'Logged in Successfully' });
        } catch (error) {
            return done(error);
        }
    }));

    passport.use(new JWTStrategy({
        secretOrKey: PRIVATE_KEY,
        jwtFromRequest: ExtractJWT.fromExtractors([accessTokenExtractor]),
    }, async (jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch (error) {
            done(error);
        }
    }));
}