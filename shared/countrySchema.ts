import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Countries table with ISO 3166-1, currency codes, and phone codes
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  countryName: text("country_name").notNull(),
  isoAlpha2: text("iso_alpha2").notNull().unique(), // ISO 3166-1 Alpha-2 (e.g., US, AU, GB)
  isoAlpha3: text("iso_alpha3").notNull().unique(), // ISO 3166-1 Alpha-3 (e.g., USA, AUS, GBR)
  isoNumeric: text("iso_numeric").notNull().unique(), // ISO 3166-1 Numeric (e.g., 840, 036, 826)
  currencyCode: text("currency_code"), // ISO 4217 Currency Code (e.g., USD, AUD, GBP)
  currencyName: text("currency_name"), // Full currency name (e.g., US Dollar, Australian Dollar)
  currencySymbol: text("currency_symbol"), // Currency symbol (e.g., $, £, €)
  phoneCode: text("phone_code"), // International dialing code (e.g., +1, +61, +44)
  region: text("region"), // Continent/Region (e.g., North America, Oceania, Europe)
  subregion: text("subregion"), // Sub-region (e.g., Northern America, Australia and New Zealand)
  isActive: integer("is_active").default(1), // 1 for active, 0 for inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Zod schemas for validation
export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const selectCountrySchema = createSelectSchema(countries);

// TypeScript types
export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;

// Helper type for scholarship country references
export type CountryReference = {
  code: string; // ISO Alpha-2 code
  name: string; // Country name
  currency?: {
    code: string;
    name: string;
    symbol: string;
  };
};