/**
 * Script to backfill geocoded coordinates for existing directory profiles
 * Run this after adding the latitude/longitude columns to the database
 * 
 * Usage: tsx scripts/backfillDirectoryCoordinates.ts
 */

import { geocodeLocation } from "../server/geocoding";
import { db } from "../server/db";
import { directoryProfiles } from "@shared/schema";
import { isNull, and, or, isNotNull, eq } from "drizzle-orm";

async function backfillCoordinates() {
  console.log("Starting coordinate backfill for directory profiles...");

  // Get all profiles that have location data but no coordinates
  const profiles = await db
    .select()
    .from(directoryProfiles)
    .where(
      and(
        // Has location data (at least one of city, state, or country)
        or(
          isNotNull(directoryProfiles.city),
          isNotNull(directoryProfiles.state),
          isNotNull(directoryProfiles.country)
        ),
        // But no coordinates
        isNull(directoryProfiles.latitude),
        isNull(directoryProfiles.longitude)
      )
    );

  console.log(`Found ${profiles.length} profiles to geocode`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const locationStr = [profile.city, profile.state, profile.country]
      .filter(Boolean)
      .join(", ");

    console.log(`[${i + 1}/${profiles.length}] Geocoding: ${locationStr} (Profile ID: ${profile.id})`);

    try {
      const coords = await geocodeLocation(
        profile.city,
        profile.state,
        profile.country
      );

      if (coords) {
        await db
          .update(directoryProfiles)
          .set({
            latitude: coords.latitude.toString(),
            longitude: coords.longitude.toString(),
          })
          .where(eq(directoryProfiles.id, profile.id));

        console.log(`  ✓ Success: ${coords.latitude}, ${coords.longitude}`);
        successCount++;
      } else {
        console.log(`  ✗ Failed: Could not geocode location`);
        failCount++;
      }
    } catch (error) {
      console.error(`  ✗ Error:`, error);
      failCount++;
    }

    // Rate limit: wait 1.1 seconds between requests
    if (i < profiles.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  console.log("\n=== Backfill Complete ===");
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total: ${profiles.length}`);
}

backfillCoordinates()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

