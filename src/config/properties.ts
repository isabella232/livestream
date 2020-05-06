import * as dotenv from 'dotenv';

dotenv.config();
export let properties = {
    sessionKey: process.env.SESSION_KEY,
    jwtToken: process.env.JWT_SECRET
};