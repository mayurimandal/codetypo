import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Define a static mock user ID to be used for the simplified login session.
const MOCK_USER_ID = "mock-user-12345"; 

// This function sets up the PostgreSQL-backed session store.
export function getSession() {
  // Ensure SESSION_SECRET is set
  if (!process.env.SESSION_SECRET) {
    throw new Error("Environment variable SESSION_SECRET must be set for session management.");
  }
    
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (Render)
      maxAge: sessionTtl,
    },
  });
}

// This function registers mock login/logout routes and session setup.
export async function setupAuth(app: Express) {
  // NOTE: This setup bypasses Replit OAuth entirely.
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Mock Serialization: Passport fetches user from session.
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // **Mock Login Route** (Automatically logs in a hardcoded "GuestCoder" for development/testing)
  app.get("/api/login", async (req, res) => {
    // 1. Ensure mock user exists in DB
    await storage.upsertUser({
      id: MOCK_USER_ID,
      username: "GuestCoder",
      email: "guest@codetype.pro",
      profileImageUrl: null,
    });
    
    // 2. Manually log in the user
    const mockUser = {
      claims: { sub: MOCK_USER_ID }, // Mock the minimal data needed by the application
      expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 3600),
    };
    req.login(mockUser, (err) => {
      if (err) return res.status(500).json({ message: "Mock login failed" });
      res.redirect("/"); // Redirect to the dashboard
    });
  });

  // **Mock Logout Route**
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) console.error("Error logging out:", err);
      res.redirect("/"); 
    });
  });

  // All Replit OAuth configurations (discovery, strategies) are now removed.
}

// Mock Authentication Middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Check if the session is authenticated and contains the mock user ID.
  if (!req.isAuthenticated() || user?.claims?.sub !== MOCK_USER_ID) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Session is valid
  return next();
};
