import { Router, Request, Response } from "express";
import { countryStorage } from "./countryStorage";

const router = Router();

// Get all active countries
router.get("/", async (req: Request, res: Response) => {
  try {
    const countries = await countryStorage.getAllCountries();
    
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('[Countries] Get all error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get countries"
    });
  }
});

// Get country by ISO code
router.get("/:code", async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const country = await countryStorage.getCountryByCode(code);
    
    if (!country) {
      return res.status(404).json({
        success: false,
        error: "Country not found"
      });
    }
    
    res.json({
      success: true,
      data: country
    });
  } catch (error) {
    console.error('[Countries] Get by code error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get country"
    });
  }
});

// Get scholarship provider countries
router.get("/providers/list", async (req: Request, res: Response) => {
  try {
    const countries = await countryStorage.getScholarshipProviderCountries();
    
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('[Countries] Get providers error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get scholarship provider countries"
    });
  }
});

// Get countries by region
router.get("/region/:region", async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    const countries = await countryStorage.getCountriesByRegion(region);
    
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('[Countries] Get by region error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get countries by region"
    });
  }
});

// Get regions with country counts
router.get("/regions/stats", async (req: Request, res: Response) => {
  try {
    const regions = await countryStorage.getRegionsWithCounts();
    
    res.json({
      success: true,
      data: regions
    });
  } catch (error) {
    console.error('[Countries] Get regions stats error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get regions statistics"
    });
  }
});

// Get currencies with countries
router.get("/currencies/list", async (req: Request, res: Response) => {
  try {
    const currencies = await countryStorage.getCurrenciesWithCountries();
    
    res.json({
      success: true,
      data: currencies
    });
  } catch (error) {
    console.error('[Countries] Get currencies error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get currencies"
    });
  }
});

// Search countries
router.get("/search/:term", async (req: Request, res: Response) => {
  try {
    const { term } = req.params;
    const countries = await countryStorage.searchCountries(term);
    
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('[Countries] Search error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to search countries"
    });
  }
});

export default router;