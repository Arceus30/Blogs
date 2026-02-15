import bcrypt from "bcrypt";

export const hashPwd = async (plainpassword) => {
    try {
        const hashedPwd = await bcrypt.hash(plainpassword, 12);
        return hashedPwd;
    } catch (err) {
        throw err;
    }
};

export const comparePwd = async (plainpassword, hashedPwd) => {
    try {
        const comparison = await bcrypt.compare(plainpassword, hashedPwd);
        return comparison;
    } catch (err) {
        throw err;
    }
};
