/**
 * Payment Storage Module
 * 
 * Handles payment operations: CRUD, payment status, delinquent users.
 */

import {
  payments,
  users,
  type Payment,
  type InsertPayment,
  type User,
} from "@shared/schema";
import { db } from "../../../db";
import { eq, desc } from "drizzle-orm";
import { NotFoundError } from "../../../errors";

export class PaymentStorage {
  constructor(private getUser: (id: string) => Promise<User | undefined>, private getAllUsers: () => Promise<User[]>) {}

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    // Explicitly build the values object to ensure all fields are included
    const values: any = {
      userId: paymentData.userId,
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      billingPeriod: paymentData.billingPeriod,
      notes: paymentData.notes ?? null,
      recordedBy: paymentData.recordedBy,
    };
    
    // Include billingMonth for monthly payments
    if ('billingMonth' in paymentData) {
      values.billingMonth = paymentData.billingMonth ?? null;
    } else {
      values.billingMonth = null;
    }
    
    // Include yearly subscription dates for yearly payments
    if ('yearlyStartMonth' in paymentData) {
      values.yearlyStartMonth = paymentData.yearlyStartMonth ?? null;
    } else {
      values.yearlyStartMonth = null;
    }
    
    if ('yearlyEndMonth' in paymentData) {
      values.yearlyEndMonth = paymentData.yearlyEndMonth ?? null;
    } else {
      values.yearlyEndMonth = null;
    }
    
    const [payment] = await db
      .insert(payments)
      .values(values)
      .returning();
    
    return payment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.paymentDate));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.paymentDate));
  }

  async getUserPaymentStatus(userId: string): Promise<{
    isDelinquent: boolean;
    missingMonths: string[];
    nextBillingDate: string | null;
    amountOwed: string;
    gracePeriodEnds?: string;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    const userPayments = await this.getPaymentsByUser(userId);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    // Check for yearly subscription coverage
    const activeYearlyPayment = userPayments.find(p => {
      if (p.billingPeriod !== 'yearly' || !p.yearlyStartMonth || !p.yearlyEndMonth) {
        return false;
      }
      const start = new Date(p.yearlyStartMonth + '-01');
      const end = new Date(p.yearlyEndMonth + '-01');
      // Set end to last day of the month
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      return now >= start && now <= end;
    });

    // If user has active yearly subscription, they're not delinquent
    if (activeYearlyPayment) {
      const endDate = new Date(activeYearlyPayment.yearlyEndMonth + '-01');
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      const nextBilling = new Date(endDate);
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      nextBilling.setDate(1);
      
      return {
        isDelinquent: false,
        missingMonths: [],
        nextBillingDate: nextBilling.toISOString().split('T')[0],
        amountOwed: '0.00',
      };
    }

    // For monthly payments, check which months are missing
    const paidMonths = new Set<string>();
    userPayments.forEach(payment => {
      if (payment.billingPeriod === 'monthly' && payment.billingMonth) {
        paidMonths.add(payment.billingMonth);
      }
    });

    // Calculate billing months starting from user's signup date
    const signupDate = user.createdAt;
    const signupMonth = new Date(signupDate.getFullYear(), signupDate.getMonth(), 1);
    const signupMonthStr = `${signupMonth.getFullYear()}-${String(signupMonth.getMonth() + 1).padStart(2, '0')}`;
    
    // Generate all expected billing months from signup to last month (current month not due yet)
    const expectedMonths: string[] = [];
    const checkDate = new Date(signupMonth);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    while (checkDate <= lastMonthDate) {
      const monthStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}`;
      expectedMonths.push(monthStr);
      // Move to next month
      checkDate.setMonth(checkDate.getMonth() + 1);
    }
    
    // Find missing months (expected months that haven't been paid)
    const missingMonths: string[] = expectedMonths.filter(month => !paidMonths.has(month));
    const monthlyRate = parseFloat(user.pricingTier);

    // Grace period: 15 days into current month
    const gracePeriodEnds = new Date(now.getFullYear(), now.getMonth(), 15);
    const isInGracePeriod = now <= gracePeriodEnds;

    // User is delinquent if they have missing months and grace period has passed
    const isDelinquent = missingMonths.length > 0 && !isInGracePeriod;
    
    // Calculate amount owed (only for actually missing months)
    const amountOwed = (missingMonths.length * monthlyRate).toFixed(2);
    
    // Next billing date is first of next month
    const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      isDelinquent,
      missingMonths,
      nextBillingDate: nextBilling.toISOString().split('T')[0],
      amountOwed,
      gracePeriodEnds: isInGracePeriod ? gracePeriodEnds.toISOString().split('T')[0] : undefined,
    };
  }

  async getDelinquentUsers(): Promise<Array<{
    userId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    missingMonths: string[];
    amountOwed: string;
    lastPaymentDate: Date | null;
  }>> {
    const allUsers = await this.getAllUsers();
    const delinquentUsers: Array<{
      userId: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      missingMonths: string[];
      amountOwed: string;
      lastPaymentDate: Date | null;
    }> = [];

    for (const user of allUsers) {
      const status = await this.getUserPaymentStatus(user.id);
      if (status.isDelinquent) {
        const userPayments = await this.getPaymentsByUser(user.id);
        const lastPayment = userPayments.length > 0 
          ? userPayments[0].paymentDate 
          : null;

        delinquentUsers.push({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          missingMonths: status.missingMonths,
          amountOwed: status.amountOwed,
          lastPaymentDate: lastPayment,
        });
      }
    }

    return delinquentUsers.sort((a, b) => {
      // Sort by number of missing months (most delinquent first)
      if (b.missingMonths.length !== a.missingMonths.length) {
        return b.missingMonths.length - a.missingMonths.length;
      }
      // Then by last payment date (oldest first)
      if (!a.lastPaymentDate && !b.lastPaymentDate) return 0;
      if (!a.lastPaymentDate) return -1;
      if (!b.lastPaymentDate) return 1;
      return a.lastPaymentDate.getTime() - b.lastPaymentDate.getTime();
    });
  }
}

