import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import {
  UserProfileSchema,
  CreateUserProfileSchema,
  PoleSchema,
  CreatePoleSchema,
  SearchFiltersSchema,
  PoleRequestSchema,
  RegisterSchema,
  LoginSchema,
  LocalUserSchema,
  JWTPayloadSchema,
} from "@/shared/types";
import z from "zod";

const app = new Hono<{ Bindings: Env }>();

// Auth utilities
const generateUserId = () => {
  return crypto.randomUUID();
};

const generateJWT = async (user: { id: string, email: string, name: string, authType: 'local' | 'google' }, secret: string) => {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    authType: user.authType,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };
  return await sign(payload, secret);
};

// Local auth middleware
const localAuthMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    const validatedPayload = JWTPayloadSchema.parse(payload);
    
    // Check if token is expired
    if (validatedPayload.exp < Math.floor(Date.now() / 1000)) {
      return c.json({ error: 'Token expired' }, 401);
    }

    // Set user in context
    c.set('localUser', {
      id: validatedPayload.userId,
      email: validatedPayload.email,
      name: validatedPayload.name,
      authType: validatedPayload.authType,
    });

    await next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Unified auth middleware (supports both Mocha and local auth)
const unifiedAuthMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  let authenticated = false;
  
  // Try local auth first
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = await verify(token, c.env.JWT_SECRET);
      const validatedPayload = JWTPayloadSchema.parse(payload);
      
      // Check if token is expired
      if (validatedPayload.exp >= Math.floor(Date.now() / 1000)) {
        // Set user in context for local auth
        c.set('user', {
          id: validatedPayload.userId,
          email: validatedPayload.email,
          name: validatedPayload.name,
        });
        c.set('authType', validatedPayload.authType);
        authenticated = true;
      }
    } catch (error) {
      // If local auth fails, fall back to Mocha auth
    }
  }

  // If local auth failed, try Mocha auth
  if (!authenticated) {
    try {
      await authMiddleware(c, async () => {
        c.set('authType', 'google');
        authenticated = true;
      });
    } catch (error) {
      return c.json({ error: 'Authentication required' }, 401);
    }
  }

  if (authenticated) {
    await next();
  } else {
    return c.json({ error: 'Authentication required' }, 401);
  }
};

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true,
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// Authentication Routes
// ============================================================================

// Get OAuth redirect URL
app.get('/api/oauth/google/redirect_url', async (c) => {
  try {
    const redirectUrl = await getOAuthRedirectUrl('google', {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    return c.json({ redirectUrl }, 200);
  } catch (error) {
    console.error('OAuth redirect URL error:', error);
    return c.json({ error: 'Failed to get redirect URL' }, 500);
  }
});

// Exchange code for session token
app.post("/api/sessions", zValidator('json', z.object({ code: z.string() })), async (c) => {
  const { code } = c.req.valid('json');

  try {
    const sessionToken = await exchangeCodeForSessionToken(code, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error('Session exchange error:', error);
    return c.json({ error: 'Failed to exchange code for session' }, 500);
  }
});

// ============================================================================
// Local Authentication Routes
// ============================================================================

// Register with email/password - Note: We only validate what backend needs
const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

app.post('/api/auth/register', zValidator('json', RegisterRequestSchema), async (c) => {
  const { email, password, name } = c.req.valid('json');

  try {
    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      "SELECT id FROM local_users WHERE email = ? COLLATE NOCASE"
    ).bind(email.toLowerCase()).first();

    if (existingUser) {
      return c.json({ error: 'En bruker med denne e-postadressen eksisterer allerede' }, 400);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate user ID
    const userId = generateUserId();

    // Create user
    await c.env.DB.prepare(`
      INSERT INTO local_users (id, email, password_hash, name)
      VALUES (?, ?, ?, ?)
    `).bind(userId, email.toLowerCase(), passwordHash, name).run();

    // Create user profile
    await c.env.DB.prepare(`
      INSERT INTO user_profiles (mocha_user_id, email, name, user_type, auth_type)
      VALUES (?, ?, ?, 'individual', 'local')
    `).bind(userId, email.toLowerCase(), name).run();

    // Generate JWT token
    const token = await generateJWT({
      id: userId,
      email: email.toLowerCase(),
      name,
      authType: 'local'
    }, c.env.JWT_SECRET);

    return c.json({
      user: {
        id: userId,
        email: email.toLowerCase(),
        name,
        authType: 'local' as const
      },
      token
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registrering feilet' }, 500);
  }
});

// Login with email/password
app.post('/api/auth/login', zValidator('json', LoginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    // Get user
    const user = await c.env.DB.prepare(
      "SELECT * FROM local_users WHERE email = ? COLLATE NOCASE"
    ).bind(email.toLowerCase()).first();

    if (!user) {
      return c.json({ error: 'Ugyldig e-post eller passord' }, 401);
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return c.json({ error: 'Ugyldig e-post eller passord' }, 401);
    }

    // Generate JWT token
    const token = await generateJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      authType: 'local'
    }, c.env.JWT_SECRET);

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        authType: 'local' as const
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Innlogging feilet' }, 500);
  }
});

// Get current user (supports both auth types)
app.get("/api/users/me", async (c) => {
  const authHeader = c.req.header('Authorization');
  let user = null;
  let authType = 'google';

  // Try local auth first
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = await verify(token, c.env.JWT_SECRET);
      const validatedPayload = JWTPayloadSchema.parse(payload);
      
      if (validatedPayload.exp >= Math.floor(Date.now() / 1000)) {
        user = {
          id: validatedPayload.userId,
          email: validatedPayload.email,
          name: validatedPayload.name,
        };
        authType = validatedPayload.authType;
      }
    } catch (error) {
      // Fall back to Mocha auth
    }
  }

  // If local auth failed, try Mocha auth
  if (!user) {
    try {
      const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
      if (sessionToken) {
        // Use existing authMiddleware logic here
        await authMiddleware(c, async () => {});
        user = c.get("user");
        authType = 'google';
      }
    } catch (error) {
      return c.json({ error: 'Authentication required' }, 401);
    }
  }

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  
  // Try to get user profile from database
  try {
    const profile = await c.env.DB.prepare(
      "SELECT * FROM user_profiles WHERE mocha_user_id = ?"
    ).bind(user.id).first();

    return c.json({ 
      user,
      authType,
      profile: profile ? UserProfileSchema.parse(profile) : null 
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return c.json({ 
      user,
      authType,
      profile: null 
    });
  }
});

// Logout
app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    try {
      await deleteSession(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// ============================================================================
// User Profile Routes
// ============================================================================

// Create or update user profile
app.post('/api/profile', unifiedAuthMiddleware, zValidator('json', CreateUserProfileSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  const profileData = c.req.valid('json');

  try {
    // Check if profile exists
    const existing = await c.env.DB.prepare(
      "SELECT id FROM user_profiles WHERE mocha_user_id = ?"
    ).bind(user.id).first();

    if (existing) {
      // Update existing profile
      await c.env.DB.prepare(`
        UPDATE user_profiles SET 
          name = ?, phone = ?, user_type = ?, club_name = ?, 
          org_number = ?, municipality = ?, postal_code = ?, updated_at = CURRENT_TIMESTAMP
        WHERE mocha_user_id = ?
      `).bind(
        profileData.name || null,
        profileData.phone || null,
        profileData.user_type,
        profileData.club_name || null,
        profileData.org_number || null,
        profileData.municipality || null,
        profileData.postal_code || null,
        user.id
      ).run();
    } else {
      // Create new profile
      await c.env.DB.prepare(`
        INSERT INTO user_profiles (
          mocha_user_id, email, name, phone, user_type, club_name, 
          org_number, municipality, postal_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        user.email,
        profileData.name || null,
        profileData.phone || null,
        profileData.user_type,
        profileData.club_name || null,
        profileData.org_number || null,
        profileData.municipality || null,
        profileData.postal_code || null
      ).run();
    }

    // Return updated profile
    const profile = await c.env.DB.prepare(
      "SELECT * FROM user_profiles WHERE mocha_user_id = ?"
    ).bind(user.id).first();

    return c.json(UserProfileSchema.parse(profile));
  } catch (error) {
    console.error('Profile creation/update error:', error);
    return c.json({ error: 'Failed to save profile' }, 500);
  }
});

// ============================================================================
// Pole Routes
// ============================================================================

// Search poles
app.get('/api/poles', zValidator('query', SearchFiltersSchema), async (c) => {
  const filters = c.req.valid('query');
  
  try {
    let query = "SELECT * FROM poles WHERE status IN ('available', 'for_sale')";
    const params: any[] = [];

    if (filters.length_min) {
      query += " AND length_cm >= ?";
      params.push(filters.length_min);
    }
    if (filters.length_max) {
      query += " AND length_cm <= ?";
      params.push(filters.length_max);
    }
    if (filters.weight_min) {
      query += " AND weight_lbs >= ?";
      params.push(filters.weight_min);
    }
    if (filters.weight_max) {
      query += " AND weight_lbs <= ?";
      params.push(filters.weight_max);
    }
    if (filters.municipality) {
      query += " AND municipality = ?";
      params.push(filters.municipality);
    }
    if (filters.brand) {
      query += " AND brand = ?";
      params.push(filters.brand);
    }
    if (filters.condition_min) {
      query += " AND condition_rating >= ?";
      params.push(filters.condition_min);
    }

    query += " ORDER BY created_at DESC";

    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    const poles = results.map(pole => {
      const sanitizedPole = {
        ...pole,
        flex_rating: pole.flex_rating || undefined,
        production_year: pole.production_year || undefined,
        image_urls: pole.image_urls || undefined,
        internal_notes: pole.internal_notes || undefined,
        serial_number: pole.serial_number || undefined,
        price_weekly: pole.price_weekly || undefined,
        price_sale: pole.price_sale || undefined,
      };
      return PoleSchema.parse(sanitizedPole);
    });

    return c.json(poles);
  } catch (error) {
    console.error('Pole search error:', error);
    return c.json({ error: 'Failed to search poles' }, 500);
  }
});

// Get single pole
app.get('/api/poles/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const pole = await c.env.DB.prepare(
      "SELECT * FROM poles WHERE id = ?"
    ).bind(id).first();

    if (!pole) {
      return c.json({ error: 'Pole not found' }, 404);
    }

    // Konverter null til undefined for valgfrie felt
    const sanitizedPole = {
      ...pole,
      flex_rating: pole.flex_rating || undefined,
      production_year: pole.production_year || undefined,
      image_urls: pole.image_urls || undefined,
      internal_notes: pole.internal_notes || undefined,
      serial_number: pole.serial_number || undefined,
      price_weekly: pole.price_weekly || undefined,
      price_sale: pole.price_sale || undefined,
    };

    return c.json(PoleSchema.parse(sanitizedPole));
  } catch (error) {
    console.error('Get pole error:', error);
    return c.json({ error: 'Failed to get pole' }, 500);
  }
});

// Create pole
app.post('/api/poles', unifiedAuthMiddleware, zValidator('json', CreatePoleSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  const poleData = c.req.valid('json');

  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO poles (
        owner_id, length_cm, weight_lbs, brand, condition_rating, status,
        municipality, postal_code, flex_rating, production_year, 
        internal_notes, serial_number, price_weekly, price_sale
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      poleData.length_cm,
      poleData.weight_lbs,
      poleData.brand,
      poleData.condition_rating,
      poleData.status,
      poleData.municipality,
      poleData.postal_code,
      poleData.flex_rating || null,
      poleData.production_year || null,
      poleData.internal_notes || null,
      poleData.serial_number || null,
      poleData.price_weekly || null,
      poleData.price_sale || null
    ).run();

    const pole = await c.env.DB.prepare(
      "SELECT * FROM poles WHERE id = ?"
    ).bind(result.meta.last_row_id).first();

    // Konverter null til undefined for valgfrie felt
    const sanitizedPole = {
      ...pole,
      flex_rating: pole.flex_rating || undefined,
      production_year: pole.production_year || undefined,
      image_urls: pole.image_urls || undefined,
      internal_notes: pole.internal_notes || undefined,
      serial_number: pole.serial_number || undefined,
      price_weekly: pole.price_weekly || undefined,
      price_sale: pole.price_sale || undefined,
    };

    return c.json(PoleSchema.parse(sanitizedPole), 201);
  } catch (error) {
    console.error('Create pole error:', error);
    return c.json({ error: 'Failed to create pole' }, 500);
  }
});

// Update pole
app.put('/api/poles/:id', unifiedAuthMiddleware, zValidator('json', CreatePoleSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  const poleId = c.req.param('id');
  const poleData = c.req.valid('json');

  try {
    // Sjekk at brukeren eier staven
    const existing = await c.env.DB.prepare(
      "SELECT owner_id FROM poles WHERE id = ?"
    ).bind(poleId).first();

    if (!existing) {
      return c.json({ error: 'Pole not found' }, 404);
    }

    if (existing.owner_id !== user.id) {
      return c.json({ error: 'You can only edit your own poles' }, 403);
    }

    // Oppdater staven
    await c.env.DB.prepare(`
      UPDATE poles SET 
        length_cm = ?, weight_lbs = ?, brand = ?, condition_rating = ?, 
        status = ?, municipality = ?, postal_code = ?, flex_rating = ?, 
        production_year = ?, internal_notes = ?, serial_number = ?, 
        price_weekly = ?, price_sale = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      poleData.length_cm,
      poleData.weight_lbs,
      poleData.brand,
      poleData.condition_rating,
      poleData.status,
      poleData.municipality,
      poleData.postal_code,
      poleData.flex_rating || null,
      poleData.production_year || null,
      poleData.internal_notes || null,
      poleData.serial_number || null,
      poleData.price_weekly || null,
      poleData.price_sale || null,
      poleId
    ).run();

    // Hent den oppdaterte staven
    const pole = await c.env.DB.prepare(
      "SELECT * FROM poles WHERE id = ?"
    ).bind(poleId).first();

    // Konverter null til undefined for valgfrie felt
    const sanitizedPole = {
      ...pole,
      flex_rating: pole.flex_rating || undefined,
      production_year: pole.production_year || undefined,
      image_urls: pole.image_urls || undefined,
      internal_notes: pole.internal_notes || undefined,
      serial_number: pole.serial_number || undefined,
      price_weekly: pole.price_weekly || undefined,
      price_sale: pole.price_sale || undefined,
    };

    return c.json(PoleSchema.parse(sanitizedPole));
  } catch (error) {
    console.error('Update pole error:', error);
    return c.json({ error: 'Failed to update pole' }, 500);
  }
});

// Delete pole
app.delete('/api/poles/:id', unifiedAuthMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  const poleId = c.req.param('id');

  try {
    // Sjekk at brukeren eier staven
    const existing = await c.env.DB.prepare(
      "SELECT owner_id FROM poles WHERE id = ?"
    ).bind(poleId).first();

    if (!existing) {
      return c.json({ error: 'Pole not found' }, 404);
    }

    if (existing.owner_id !== user.id) {
      return c.json({ error: 'You can only delete your own poles' }, 403);
    }

    // Slett staven
    await c.env.DB.prepare(
      "DELETE FROM poles WHERE id = ?"
    ).bind(poleId).run();

    return c.json({ success: true, message: 'Pole deleted successfully' });
  } catch (error) {
    console.error('Delete pole error:', error);
    return c.json({ error: 'Failed to delete pole' }, 500);
  }
});

// Get user's poles
app.get('/api/my-poles', unifiedAuthMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM poles WHERE owner_id = ? ORDER BY created_at DESC"
    ).bind(user.id).all();

    const poles = results.map(pole => {
      const sanitizedPole = {
        ...pole,
        flex_rating: pole.flex_rating || undefined,
        production_year: pole.production_year || undefined,
        image_urls: pole.image_urls || undefined,
        internal_notes: pole.internal_notes || undefined,
        serial_number: pole.serial_number || undefined,
        price_weekly: pole.price_weekly || undefined,
        price_sale: pole.price_sale || undefined,
      };
      return PoleSchema.parse(sanitizedPole);
    });
    return c.json(poles);
  } catch (error) {
    console.error('Get user poles error:', error);
    return c.json({ error: 'Failed to get user poles' }, 500);
  }
});

// ============================================================================
// Pole Request Routes
// ============================================================================

// Create pole request
app.post('/api/poles/:id/request', unifiedAuthMiddleware, zValidator('json', z.object({
  request_type: z.enum(['rent', 'buy']),
  message: z.string().optional(),
  rental_start_date: z.string().optional(),
  rental_end_date: z.string().optional(),
})), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  const poleId = c.req.param('id');
  const requestData = c.req.valid('json');

  try {
    // Get pole owner
    const pole = await c.env.DB.prepare(
      "SELECT owner_id FROM poles WHERE id = ?"
    ).bind(poleId).first();

    if (!pole) {
      return c.json({ error: 'Pole not found' }, 404);
    }

    if (pole.owner_id === user.id) {
      return c.json({ error: 'Cannot request your own pole' }, 400);
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO pole_requests (
        pole_id, requester_id, owner_id, request_type, message, 
        rental_start_date, rental_end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      poleId,
      user.id,
      pole.owner_id,
      requestData.request_type,
      requestData.message || null,
      requestData.rental_start_date || null,
      requestData.rental_end_date || null
    ).run();

    const request = await c.env.DB.prepare(
      "SELECT * FROM pole_requests WHERE id = ?"
    ).bind(result.meta.last_row_id).first();

    return c.json(PoleRequestSchema.parse(request), 201);
  } catch (error) {
    console.error('Create pole request error:', error);
    return c.json({ error: 'Failed to create request' }, 500);
  }
});

export default app;
