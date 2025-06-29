import { ImageAnnotatorClient } from '@google-cloud/vision';

interface GoogleVisionConfig {
  apiKey: string;
}

class GoogleVisionService {
  private client: ImageAnnotatorClient;

  constructor(config: GoogleVisionConfig) {
    this.client = new ImageAnnotatorClient({
      apiKey: config.apiKey,
    });
  }

  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      const [result] = await this.client.textDetection({
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
    try {
      const [result] = await this.client.documentTextDetection({
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

// Export singleton instance
const googleVisionService = new GoogleVisionService({
  apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY || '',
});

export { googleVisionService, GoogleVisionService };