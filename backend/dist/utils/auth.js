"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_js_1 = require("./jwt.js");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: 'Authorization header missing',
        });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Bearer token missing',
        });
    }
    const decoded = (0, jwt_js_1.verifyToken)(token);
    if (!decoded) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
        });
    }
    req.user = decoded;
    next();
};
exports.authMiddleware = authMiddleware;
