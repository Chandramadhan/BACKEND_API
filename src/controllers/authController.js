import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

const register = async (req, res) => {
  console.log("register body:", req.body);

  const { name, email, password } = req.body;
  console.log("name:", name, "email:", email);

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "name, email, and password are required" });
  }

  try {
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({
        error: "User already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);



    //Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    
 //Generate JWT Token

    const token = generateToken(user.id,res);

    return res.status(200).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
       
      },
       token,
    });
  } catch (err) {
    console.error("Prisma error in register:", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: err.meta || err.message,
    });
  }
};

const login = async (req, res) => {
  console.log("login body:", req.body);

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    //Generate JWT Token

    const token = generateToken(user.id,res);

    return res.status(201).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        
      },
      token,
    });
  } catch (err) {
    console.error("Prisma error in login:", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: err.meta || err.message,
    });
  }
};

const logout = async (req, res) => {
  res.cookie("jwt","",{
    expires: new Date(0),
    httpOnly: true
  })
  res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
};

export { register, login ,logout};
