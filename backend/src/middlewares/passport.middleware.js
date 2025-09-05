import passport from 'passport';

export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, (err, user, info) => {
            if (err) {
                req.logger.error('An error ocurred in the authentication process: ' + err);
                return res.sendInternalServerError('An error ocurred in the authentication process: ' + err)
            };

            if (!user) return res.sendBadRequestError('An error occurred in the authentication process: ' + info.message);

            req.user = user;
            return next();
        }) (req, res, next);
    }
}