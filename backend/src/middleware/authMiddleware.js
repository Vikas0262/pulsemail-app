import jwt from "jsonwebtoken";
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.accountId = decoded.accountId;
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};
export default authMiddleware;
//# sourceMappingURL=authMiddleware.js.map