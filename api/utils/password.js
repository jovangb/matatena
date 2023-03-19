const bcrypt = require('bcryptjs');

class Password {
    constructor(){
        this.saltRounds = 12;
    }
    
    async generatePassword(data){
        let password;
        if(process.env.NODE_ENV == 'production'){
            password = data+"";
        }else if(process.env.NODE_ENV == 'development'){
            password = data+"";
        }

        const salt = await bcrypt.genSalt(this.saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        return hashedPassword;
    }

    async comparePassword(candidatePassword, userPassword){
        if(!userPassword) return false;

        const isValid = await bcrypt.compare(candidatePassword, userPassword);

        return isValid;
    }

    async updatePassword(newPassword){
        const salt = await bcrypt.genSalt(this.saltRounds);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        return hashedPassword;
    }
}

module.exports = Password;