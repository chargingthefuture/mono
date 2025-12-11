import { storage } from "./storage";

async function initializeDefaultPricingTier() {
  try {
    // Check if a current pricing tier exists
    const currentTier = await storage.getCurrentPricingTier();
    
    if (!currentTier) {
      await storage.createPricingTier({
        amount: '1.00',
        effectiveDate: new Date(),
        isCurrentTier: true,
      });
    }
  } catch (error) {
    console.error("Error initializing pricing tier:", error);
  }
}

// Run initialization
initializeDefaultPricingTier();
