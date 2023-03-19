require('dotenv').config();

const { Employee } = require('../models/employees.model');

const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

exports.LocalStrategy = async(passport) => {
    const pwPattern = process.env.PWPATTERN 

    const localStrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: pwPattern,
        algorithms: ['HS256']
    }

    const localStrategy = new JWTStrategy(localStrategyOptions, async (payload, done) => {
        try {
            const currentUser = await Employee.findOne({
                where: {
                    id: payload.sub
                }
            });

            if(!currentUser) {
                return done(null, false)
            }else{
                return done(null, currentUser)
            }
        }catch(err){
            done(err, null)
        }
    });

    passport.use(localStrategy);
}