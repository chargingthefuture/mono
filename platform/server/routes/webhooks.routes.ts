/**
 * Webhook routes
 */

import express, { type Express } from "express";
import { Webhook } from "svix";
import { syncClerkUserToDatabase } from "../auth";
import { asyncHandler } from "../errorHandler";
import { ValidationError, UnauthorizedError } from "../errors";
import { logError } from "../errorLogger";

export function registerWebhookRoutes(app: Express) {
  // Clerk webhook endpoint for user events
  // Note: This endpoint should be configured in Clerk Dashboard with webhook secret
  // Configure the webhook URL in Clerk Dashboard: https://app.chargingthefuture.com/api/webhooks/clerk
  // Set CLERK_WEBHOOK_SECRET environment variable with the signing secret from Clerk Dashboard
  app.post('/api/webhooks/clerk', asyncHandler(async (req: any, res) => {
    // Verify webhook signature using svix to prevent unauthorized requests
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    
    if (!webhookSecret) {
      const error = new ValidationError(
        "Webhook secret not configured. Please set CLERK_WEBHOOK_SECRET environment variable. " +
        "To get the webhook secret: 1) Go to Clerk Dashboard > Webhooks, 2) Select your webhook endpoint, " +
        "3) Copy the 'Signing Secret' from the webhook details, 4) Set it as CLERK_WEBHOOK_SECRET in your deployment environment."
      );
      logError(error, req);
      throw error;
    }

    // Get the raw body (stored by express.json middleware in index.ts)
    // The raw body is required for signature verification - parsed JSON won't work
    const rawBody = req.rawBody;
    if (!rawBody) {
      const error = new ValidationError("Invalid request: raw body required for webhook signature verification");
      logError(error, req);
      throw error;
    }

    // Get svix headers for signature verification
    // Clerk uses Svix for webhook delivery, which includes these security headers
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      const error = new ValidationError("Missing webhook signature headers. This request may not be from Clerk.");
      logError(error, req, 'error');
      throw error;
    }

    // Verify webhook signature using svix Webhook class
    // This ensures the request is authentic and hasn't been tampered with
    const wh = new Webhook(webhookSecret);
    let event: any;
    try {
      // wh.verify() throws an error if signature is invalid
      // It accepts Buffer or string, and returns the parsed event payload
      event = wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as any;
    } catch (verificationError: any) {
      const error = new UnauthorizedError("Invalid webhook signature. Request rejected for security reasons.");
      // Log with additional context about the verification failure
      // Note: logError will extract request context automatically, but we can't add custom details
      // The verification error details are logged via console.error as a fallback
      logError(error, req);
      throw error;
    }

    // Process verified webhook events
    // For user.created and user.updated events, sync the Clerk user into our database
    if (event?.type === 'user.created' || event?.type === 'user.updated') {
      const clerkUserId = event.data?.id;
      if (clerkUserId) {
        try {
          await syncClerkUserToDatabase(clerkUserId);
        } catch (syncError: any) {
          // Log the sync error but don't fail the webhook delivery
          // Clerk will retry if we return a non-2xx status, but we want to acknowledge receipt
          // The sync error is logged but doesn't prevent webhook acknowledgment
          logError(syncError, req);
        }
      }
    }
    
    // Acknowledge successful webhook receipt
    // Clerk expects a 2xx response to mark the webhook as delivered
    res.json({ received: true, eventType: event?.type || 'unknown' });
  }));
}

