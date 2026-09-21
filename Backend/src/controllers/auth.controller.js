const prisma = require("../config/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../config/config.js");
const { sendWelcomeEmail, sendResetPasswordEmail } = require("../services/emailTemplate.service");
const crypto = require("crypto");

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

// ==========================
// REGISTER
// ==========================


async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // =====================
    // VALIDATION
    // =====================

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    // =====================
    // CHECK EXISTING USER
    // =====================

    const isExistingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (isExistingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email already exists",
      });
    }

    // =====================
    // HASH PASSWORD
    // =====================

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    // =====================
    // CREATE USER
    // =====================

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

    // =====================
    // SEND WELCOME EMAIL
    // =====================

    try {
      await sendWelcomeEmail(
        user.email,
        user.name
      );
    } catch (emailError) {
      console.error(
        "WELCOME EMAIL ERROR:",
        emailError
      );
    }

    // =====================
    // GENERATE JWT
    // =====================

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn:
          env.JWT_EXPIRES_IN,
      }
    );

    // =====================
    // SET COOKIE
    // =====================

    res.cookie(
      "token",
      token,
      cookieOptions
    );

    // =====================
    // RESPONSE
    // =====================

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}


// ==========================
// LOGIN
// ==========================

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN,
      }
    );

    // Set cookie
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
      },
    });
  }
  catch (error) {
    
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// ==========================
// LOGOUT
// ==========================

function logout(req, res) {
  try {
    const token = req.cookies?.token;

    // No token in browser
    if (!token) {
      return res.status(200).json({
        success: true,
        message: "Already logged out",
      });
    }

    // Remove token cookie
    res.clearCookie("token", {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// ==========================
// GETME
// ==========================

const getUser = async (req, res) => {
  try {
    // Check middleware attached user
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
       where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        level: true,
        createdAt: true,
      },
    });

    // User deleted from DB but still has token
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// ==========================
// FORGOT PASSWORD
// ==========================

const forgotPassword = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    const resetToken =
      crypto.randomBytes(32)
        .toString("hex");

    const resetTokenExp =
      new Date(
        Date.now() +
          15 * 60 * 1000
      );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken,
        resetTokenExp,
      },
    });

    const resetUrl =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendResetPasswordEmail(
      user.email,
      user.name,
      resetUrl
    );

    return res.status(200).json({
      success: true,
      message:
        "Password reset email sent",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Server error",
    });
  }
};

// ==========================
//RESET PASSWORD
// ==========================

const resetPassword = async (
  req,
  res
) => {
  try {
    const { token } =
      req.params;

    const { password } =
      req.body;

    const user =
      await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExp: {
            gt: new Date(),
          },
        },
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Server error",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword
};
