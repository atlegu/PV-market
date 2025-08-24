import z from "zod";

// User profile schema
export const UserProfileSchema = z.object({
  id: z.number(),
  mocha_user_id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  user_type: z.enum(['individual', 'club']),
  club_name: z.string().optional(),
  org_number: z.string().optional(),
  municipality: z.string().optional(),
  postal_code: z.string().optional(),
  is_verified: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Pole schema
export const PoleSchema = z.object({
  id: z.number(),
  owner_id: z.string(),
  length_cm: z.number().min(250).max(520),
  weight_lbs: z.number().min(50).max(210),
  brand: z.string(),
  condition_rating: z.number().min(1).max(5),
  status: z.enum(['available', 'rented', 'reserved', 'for_sale', 'unavailable']),
  municipality: z.string(),
  postal_code: z.string(),
  flex_rating: z.string().optional(),
  production_year: z.number().optional(),
  image_urls: z.string().optional(), // JSON array
  internal_notes: z.string().optional(),
  serial_number: z.string().optional(),
  price_weekly: z.number().optional(),
  price_sale: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Pole = z.infer<typeof PoleSchema>;

// Pole request schema
export const PoleRequestSchema = z.object({
  id: z.number(),
  pole_id: z.number(),
  requester_id: z.string(),
  owner_id: z.string(),
  request_type: z.enum(['rent', 'buy']),
  status: z.enum(['pending', 'accepted', 'declined', 'completed']),
  message: z.string().optional(),
  rental_start_date: z.string().optional(),
  rental_end_date: z.string().optional(),
  agreed_price: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PoleRequest = z.infer<typeof PoleRequestSchema>;

// Search filters schema
export const SearchFiltersSchema = z.object({
  length_min: z.number().optional(),
  length_max: z.number().optional(),
  weight_min: z.number().optional(),
  weight_max: z.number().optional(),
  municipality: z.string().optional(),
  postal_code: z.string().optional(),
  radius_km: z.number().optional(),
  brand: z.string().optional(),
  condition_min: z.number().optional(),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

// Pole creation/update schemas
export const CreatePoleSchema = z.object({
  length_cm: z.number().min(250).max(520),
  weight_lbs: z.number().min(50).max(210),
  brand: z.string().min(1),
  condition_rating: z.number().min(1).max(5),
  status: z.enum(['available', 'rented', 'reserved', 'for_sale', 'unavailable']).default('available'),
  municipality: z.string().min(1),
  postal_code: z.string().min(4).max(4),
  flex_rating: z.string().optional(),
  production_year: z.number().optional(),
  internal_notes: z.string().optional(),
  serial_number: z.string().optional(),
  price_weekly: z.number().optional(),
  price_sale: z.number().optional(),
});

export type CreatePole = z.infer<typeof CreatePoleSchema>;

// Profile creation/update schemas
export const CreateUserProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  user_type: z.enum(['individual', 'club']),
  club_name: z.string().optional(),
  org_number: z.string().optional(),
  municipality: z.string().optional(),
  postal_code: z.string().optional(),
});

export type CreateUserProfile = z.infer<typeof CreateUserProfileSchema>;

// Pole brands constants
export const POLE_BRANDS = [
  'Altius Carbon Elite',
  'Altius Fiberglass',
  'Altius Suhr Adrenaline',
  'Essx',
  'Essx Launch',
  'Essx Power X',
  'Essx Recoil',
  'Essx Recoil Advanced',
  'Fibersport Carbon',
  'Fibersport Carbon +',
  'Fibersport Non-Carbon',
  'Nordic',
  'Nordic Bifrost Glassfiber',
  'Nordic Bifrost Hybrid',
  'Nordic Evolution',
  'Nordic HiFly',
  'Pacer',
  'Pacer Carbon FX',
  'Pacer One',
  'Pacer Composite',
  'Pacer Mystic',
  'Annen'
] as const;

// Norwegian municipalities (top ones for pole vaulting)
export const MUNICIPALITIES = [
  'Oslo',
  'Bergen',
  'Trondheim',
  'Stavanger',
  'Kristiansand',
  'Fredrikstad',
  'Sandnes',
  'Tromsø',
  'Drammen',
  'Asker',
  'Lillestrøm',
  'Moss',
  'Annen'
] as const;

// ============================================================================
// Local Authentication Schemas
// ============================================================================

// Local user schema
export const LocalUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  email_verified: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export type LocalUser = z.infer<typeof LocalUserSchema>;

// Registration schema
export const RegisterSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(8, "Passordet må være minst 8 tegn"),
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passordene matcher ikke",
  path: ["confirmPassword"],
});

export type RegisterData = z.infer<typeof RegisterSchema>;

// Login schema
export const LoginSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(1, "Passord er påkrevd"),
});

export type LoginData = z.infer<typeof LoginSchema>;

// JWT payload schema
export const JWTPayloadSchema = z.object({
  userId: z.string(),
  email: z.string(),
  name: z.string(),
  authType: z.enum(['local', 'google']),
  iat: z.number(),
  exp: z.number(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// Auth response schema
export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    authType: z.enum(['local', 'google']),
  }),
  token: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// User session schema
export const UserSessionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  auth_type: z.enum(['local', 'google']),
  expires_at: z.string(),
  created_at: z.string(),
});

export type UserSession = z.infer<typeof UserSessionSchema>;
