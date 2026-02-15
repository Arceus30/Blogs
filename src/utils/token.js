import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) => {
    try {
        const accessToken = jwt.sign(
            {
                userId: payload._id,
            },
            process.env.ACCESS_SECRET,
            {
                expiresIn: "15m",
            },
        );
        return accessToken;
    } catch (err) {
        throw err;
    }
};

export const generateRefreshToken = (payload) => {
    try {
        const refreshToken = jwt.sign(
            {
                userId: payload._id,
                version: payload.version,
            },
            process.env.REFRESH_SECRET,
            {
                expiresIn: "7d",
            },
        );
        return refreshToken;
    } catch (err) {
        throw err;
    }
};

export const verifyAccessToken = (token) => {
    try {
        const verifiedResult = jwt.verify(token, process.env.ACCESS_SECRET);
        return verifiedResult;
    } catch (err) {
        throw err;
    }
};

export const verifyRefreshToken = (token) => {
    try {
        const verifiedResult = jwt.verify(token, process.env.REFRESH_SECRET);
        return verifiedResult;
    } catch (err) {
        throw err;
    }
};
