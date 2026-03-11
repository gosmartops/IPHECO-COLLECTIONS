
import { GoogleGenAI, Type } from "@google/genai";
import { Product, StylistResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFashionAdvice = async (userQuery: string, availableProducts: Product[]): Promise<StylistResponse> => {
  try {
    // If there are no products, the AI should let the user know we are updating stock
    if (availableProducts.length === 0) {
      return {
        advice: "We are currently updating our collections with new arrivals. Please check back in a few moments to see our latest styles!",
        recommendedProductIds: []
      };
    }

    const productsContext = availableProducts.map(p => 
      `ID: ${p.id}, NAME: ${p.name}, CAT: ${p.category}, DESC: ${p.description}, PRICE: ₦${p.price.toLocaleString()}`
    ).join('\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are the "IPHECO Style Helper". 
        Suggest 1 or 2 items from the current shop list for the user based on their request.
        
        CURRENT SHOP ITEMS:
        ${productsContext}
        
        USER REQUEST: "${userQuery}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: {
              type: Type.STRING,
              description: "Helpful and friendly style advice tailored to the user's query."
            },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of IDs for the items being recommended."
            }
          },
          required: ["advice", "recommendedProductIds"]
        },
        systemInstruction: `
          You are a professional and friendly fashion consultant for IPHECO Smart Collections.
          Speak clearly and professionally.
          ONLY recommend products that are in the provided list.
          If no products match well, give general style advice but do not invent product IDs.
        `
      }
    });

    return JSON.parse(response.text) as StylistResponse;
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return {
      advice: "Looking good is good business! Our style helper is currently taking a short break, but feel free to browse our latest collection below.",
      recommendedProductIds: availableProducts.length > 0 ? [availableProducts[0].id] : []
    };
  }
};
