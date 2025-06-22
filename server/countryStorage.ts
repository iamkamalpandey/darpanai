import { db } from "./db";
import { countries, type Country, type InsertCountry } from "@shared/countrySchema";
import { eq, and, sql } from "drizzle-orm";

export class CountryStorage {
  // Get all active countries
  async getAllCountries(): Promise<Country[]> {
    try {
      return await db
        .select()
        .from(countries)
        .where(eq(countries.isActive, 1))
        .orderBy(countries.countryName);
    } catch (error) {
      console.error('[CountryStorage] Get all countries error:', error);
      throw new Error('Failed to get countries');
    }
  }

  // Get country by ISO Alpha-2 code
  async getCountryByCode(isoAlpha2: string): Promise<Country | null> {
    try {
      const [country] = await db
        .select()
        .from(countries)
        .where(and(
          eq(countries.isoAlpha2, isoAlpha2.toUpperCase()),
          eq(countries.isActive, 1)
        ));
      
      return country || null;
    } catch (error) {
      console.error('[CountryStorage] Get country by code error:', error);
      throw new Error('Failed to get country');
    }
  }

  // Get countries by region
  async getCountriesByRegion(region: string): Promise<Country[]> {
    try {
      return await db
        .select()
        .from(countries)
        .where(and(
          eq(countries.region, region),
          eq(countries.isActive, 1)
        ))
        .orderBy(countries.countryName);
    } catch (error) {
      console.error('[CountryStorage] Get countries by region error:', error);
      throw new Error('Failed to get countries by region');
    }
  }

  // Get scholarship provider countries (countries that provide scholarships)
  async getScholarshipProviderCountries(): Promise<Country[]> {
    try {
      // Get distinct provider countries from scholarships table
      const providerCountries = await db.execute(sql`
        SELECT DISTINCT c.*
        FROM countries c
        INNER JOIN scholarships s ON c.iso_alpha2 = s.provider_country
        WHERE c.is_active = 1 AND s.status = 'active'
        ORDER BY c.country_name
      `);
      
      return providerCountries.rows.map(row => ({
        id: row.id as number,
        countryName: row.country_name as string,
        isoAlpha2: row.iso_alpha2 as string,
        isoAlpha3: row.iso_alpha3 as string,
        isoNumeric: row.iso_numeric as string,
        currencyCode: row.currency_code as string,
        currencyName: row.currency_name as string,
        currencySymbol: row.currency_symbol as string,
        phoneCode: row.phone_code as string,
        region: row.region as string,
        subregion: row.subregion as string,
        isActive: row.is_active as number,
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date
      }));
    } catch (error) {
      console.error('[CountryStorage] Get scholarship provider countries error:', error);
      throw new Error('Failed to get scholarship provider countries');
    }
  }

  // Get regions with country counts
  async getRegionsWithCounts(): Promise<Array<{ region: string; count: number }>> {
    try {
      const regions = await db.execute(sql`
        SELECT region, COUNT(*) as count
        FROM countries
        WHERE is_active = 1
        GROUP BY region
        ORDER BY count DESC, region
      `);
      
      return regions.rows.map(row => ({
        region: row.region as string,
        count: Number(row.count)
      }));
    } catch (error) {
      console.error('[CountryStorage] Get regions with counts error:', error);
      throw new Error('Failed to get regions with counts');
    }
  }

  // Get currencies with country information
  async getCurrenciesWithCountries(): Promise<Array<{
    currencyCode: string;
    currencyName: string;
    currencySymbol: string;
    countries: Array<{ code: string; name: string }>;
  }>> {
    try {
      const currencies = await db.execute(sql`
        SELECT 
          currency_code,
          currency_name,
          currency_symbol,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'code', iso_alpha2,
              'name', country_name
            ) ORDER BY country_name
          ) as countries
        FROM countries
        WHERE is_active = 1 AND currency_code IS NOT NULL
        GROUP BY currency_code, currency_name, currency_symbol
        ORDER BY currency_name
      `);
      
      return currencies.rows.map(row => ({
        currencyCode: row.currency_code as string,
        currencyName: row.currency_name as string,
        currencySymbol: row.currency_symbol as string,
        countries: row.countries as Array<{ code: string; name: string }>
      }));
    } catch (error) {
      console.error('[CountryStorage] Get currencies with countries error:', error);
      throw new Error('Failed to get currencies with countries');
    }
  }

  // Create new country
  async createCountry(countryData: InsertCountry): Promise<Country> {
    try {
      const [country] = await db
        .insert(countries)
        .values({
          ...countryData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return country;
    } catch (error) {
      console.error('[CountryStorage] Create country error:', error);
      throw new Error('Failed to create country');
    }
  }

  // Update country
  async updateCountry(id: number, countryData: Partial<InsertCountry>): Promise<Country | null> {
    try {
      const [country] = await db
        .update(countries)
        .set({
          ...countryData,
          updatedAt: new Date()
        })
        .where(eq(countries.id, id))
        .returning();
      
      return country || null;
    } catch (error) {
      console.error('[CountryStorage] Update country error:', error);
      throw new Error('Failed to update country');
    }
  }

  // Deactivate country (soft delete)
  async deactivateCountry(id: number): Promise<boolean> {
    try {
      const result = await db
        .update(countries)
        .set({
          isActive: 0,
          updatedAt: new Date()
        })
        .where(eq(countries.id, id));
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('[CountryStorage] Deactivate country error:', error);
      throw new Error('Failed to deactivate country');
    }
  }

  // Search countries by name
  async searchCountries(searchTerm: string): Promise<Country[]> {
    try {
      return await db
        .select()
        .from(countries)
        .where(and(
          sql`${countries.countryName} ILIKE ${`%${searchTerm}%`}`,
          eq(countries.isActive, 1)
        ))
        .orderBy(countries.countryName)
        .limit(20);
    } catch (error) {
      console.error('[CountryStorage] Search countries error:', error);
      throw new Error('Failed to search countries');
    }
  }
}

export const countryStorage = new CountryStorage();