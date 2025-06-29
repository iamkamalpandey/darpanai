import { ImageAnnotatorClient } from '@google-cloud/vision';

interface GoogleVisionConfig {
  apiKey?: string;
  credentials?: any;
}

class GoogleVisionService {
  private client: ImageAnnotatorClient | null = null;
  private isEnabled: boolean = false;

  constructor(config: GoogleVisionConfig) {
    try {
      // Try to initialize Google Vision client with proper authentication
      if (config.credentials) {
        // Use service account credentials (preferred method)
        this.client = new ImageAnnotatorClient({
          credentials: config.credentials,
        });
        this.isEnabled = true;
      } else if (config.apiKey) {
        // Fallback to API key (less reliable)
        this.client = new ImageAnnotatorClient({
          apiKey: config.apiKey,
        });
        this.isEnabled = true;
      } else {
        console.warn('Google Vision API not configured - using fallback methods');
        this.isEnabled = false;
      }
    } catch (error) {
      console.warn('Failed to initialize Google Vision API:', error);
      this.isEnabled = false;
    }
  }

  isAvailable(): boolean {
    return this.isEnabled && this.client !== null;
  }

  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Google Vision API is not available - service not configured');
    }

    try {
      const [result] = await this.client!.textDetection({
        image: {
          content: imageBuffer.toString('base64'),
        },
      });

      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        throw new Error('No text detected in the image');
      }

      // The first annotation contains the full text
      const fullText = detections[0].description || '';
      return fullText;
    } catch (error: any) {
      console.error('Google Vision API error:', error);
      throw new Error(`Failed to extract text from image: ${error?.message || 'Unknown error'}`);
    }
  }

  async analyzeDocument(imageBuffer: Buffer): Promise<{
    text: string;
    confidence: number;
    pages: number;
  }> {
    if (!this.isAvailable()) {
      throw new Error('Google Vision API is not available - service not configured');
    }

    try {
      const [result] = await this.client!.documentTextDetection({
        image: {
          content: imageBuffer.toString('base64'),
        },
      });

      const fullTextAnnotation = result.fullTextAnnotation;
      if (!fullTextAnnotation) {
        throw new Error('No document text detected');
      }

      const text = fullTextAnnotation.text || '';
      const pages = fullTextAnnotation.pages?.length || 1;
      
      // Calculate average confidence from all detected text
      let totalConfidence = 0;
      let confidenceCount = 0;
      
      fullTextAnnotation.pages?.forEach(page => {
        page.blocks?.forEach(block => {
          if (block.confidence !== undefined && block.confidence !== null) {
            totalConfidence += block.confidence;
            confidenceCount++;
          }
        });
      });

      const confidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0.5;

      return {
        text,
        confidence,
        pages
      };
    } catch (error: any) {
      console.error('Google Vision document analysis error:', error);
      throw new Error(`Failed to analyze document: ${error?.message || 'Unknown error'}`);
    }
  }
}

// Export singleton instance with proper error handling
let googleVisionService: GoogleVisionService;

try {
  // Try to parse service account credentials from environment
  let credentials;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    } catch (error) {
      console.warn('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', error);
    }
  }

  googleVisionService = new GoogleVisionService({
    apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
    credentials: credentials,
  });
} catch (error) {
  console.warn('Failed to initialize Google Vision service:', error);
  // Create a disabled service instance
  googleVisionService = new GoogleVisionService({});
}

export { googleVisionService, GoogleVisionService };