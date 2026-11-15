const jwt = require('jsonwebtoken');
const User = require('../models/User');

const secret = () => process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, tv: user.tokenVersion },
    secret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

// Middleware: verifies JWT, loads user, checks token version (single session)
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret());
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await User.findById(payload.sub).select('-password');
    if (!user) return res.status(401).json({ error: 'User no longer exists' });

    // Token versioning: a newer login (or logout) bumps tokenVersion,
    // which instantly invalidates every older token.
    if (payload.tv !== user.tokenVersion) {
      return res.status(401).json({ error: 'Session expired: logged in elsewhere or logged out' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// RBAC: allow only the listed roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { signToken, authenticate, requireRole };
