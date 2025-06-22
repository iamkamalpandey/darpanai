import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Countries table with ISO 3166-1, currency codes, and phone codes
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  countryName: text("country_name").notNull(),
  isoAlpha2: text("iso_alpha2").notNull().unique(), // ISO 3166-1 Alpha-2 (2-digit country short code)
  isoAlpha3: text("iso_alpha3").notNull().unique(), // ISO 3166-1 Alpha-3 (3-digit country short code)
  currencyCode: text("currency_code"), // ISO 4217 Currency Code (3-digit currency short code)
  currencyName: text("currency_name"), // Currency name (how it is named)
  phoneCode: text("phone_code"), // International dialing code
  region: text("region"), // Continent/Region
  subregion: text("subregion"), // Sub-region
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
  };
};