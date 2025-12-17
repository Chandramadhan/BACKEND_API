import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";


//Read the token from the request
//Check if the token is valid
const authMiddleware = async (req, res, next) => {
    console.log("Auth middleware called");
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }
    else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if(!token){
        return res.status(401).json({error: "Unauthorized"});
    }

    try{
        //Verify token and extract user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });
        if(!user){
            return res.status(401).json({error: "Unauthorized"});
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({error: "Unauthorized"});
    }
};

export { authMiddleware }