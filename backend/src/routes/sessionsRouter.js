import Router from './router.js'
import { sessionsController } from '../controllers/sessions.controller.js' 
import { passportCall } from '../middlewares/passport.middleware.js';

class SessionsRouter extends Router {
    init() {
        this.post('/signup', ["PUBLIC"], passportCall('signup'), async (req, res) => this.controller.signup(req, res));
        this.post('/login', ["PUBLIC"], passportCall('login'), async (req, res) => this.controller.login(req, res));
        this.post('/refresh', ["PUBLIC"], async (req, res) => this.controller.refresh(req, res));
        this.post('/logout', ["USER"], async (req, res) => this.controller.logout(req, res));
    }
}

export const sessionsRouter = new SessionsRouter(sessionsController);