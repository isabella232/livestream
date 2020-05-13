import * as dotenv from 'dotenv';

dotenv.config();
export let properties = {
    sessionKey: process.env.SESSION_KEY,
    jwtToken: process.env.JWT_SECRET,
    revAIToken: '02JAzLskvm-ikK7ROlzEs_i1W57PNvvE8p5kuBJfqU9TAIjaHAl8_bFFbAG2Xr78wwxevqva9yvpY8BMuP4lky7Fmt2pg'
};
