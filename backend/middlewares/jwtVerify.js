import jwt from 'jsonwebtoken';

export const jwtVerify = async (req, res, next) => {
  try {
    const token = req.cookies.jwt_token;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No Token Provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(404).json({ error: 'Unauthorized: Invalid Token' });
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log('Error in jwt Verify middleware', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
