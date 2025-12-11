import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PrivacyField } from "@/components/ui/privacy-field";
import type { User, Payment } from "@shared/schema";
import { DollarSign, Check, ChevronsUpDown, AlertCircle, Clock } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export default function AdminPayments() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState<string>(() => {
    // Default to current date in YYYY-MM-DD format
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [billingMonth, setBillingMonth] = useState<string>(() => {
    // Default to current month in YYYY-MM format
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [yearlyStartMonth, setYearlyStartMonth] = useState<string>(() => {
    // Default to current month in YYYY-MM format
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [yearlyEndMonth, setYearlyEndMonth] = useState<string>(() => {
    // Default to 12 months from now in YYYY-MM format
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 12, 1);
    return `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
  });
  const [notes, setNotes] = useState("");

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
  });

  const { data: delinquentUsers, isLoading: isLoadingDelinquent } = useQuery<Array<{
    userId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    missingMonths: string[];
    amountOwed: string;
    lastPaymentDate: Date | null;
  }>>({
    queryKey: ["/api/admin/payments/delinquent"],
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      // Validate required fields
      if (!selectedUserId) {
        throw new Error("Please select a user");
      }
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }
      
      // Validate billingMonth is set for monthly payments
      if (billingPeriod === "monthly" && !billingMonth) {
        throw new Error("Please select the billing month");
      }
      
      // Validate yearly subscription dates
      if (billingPeriod === "yearly") {
        if (!yearlyStartMonth) {
          throw new Error("Please select the yearly subscription start month");
        }
        if (!yearlyEndMonth) {
          throw new Error("Please select the yearly subscription end month");
        }
      }
      
      // Validate payment date
      if (!paymentDate) {
        throw new Error("Please select the payment date");
      }
      
      const payload: any = {
        userId: selectedUserId,
        amount: amount, // Send as string, not parseFloat(amount)
        paymentDate: new Date(paymentDate).toISOString(), // Convert date string to ISO
        paymentMethod,
        billingPeriod,
        notes: notes || null,
      };
      
      // Include billingMonth for monthly payments
      if (billingPeriod === "monthly" && billingMonth) {
        payload.billingMonth = billingMonth;
      }
      
      // Include yearly subscription dates for yearly payments
      if (billingPeriod === "yearly") {
        payload.yearlyStartMonth = yearlyStartMonth;
        payload.yearlyEndMonth = yearlyEndMonth;
      }
      
      // Debug logging removed for production
      
      return await apiRequest("POST", "/api/admin/payments", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDialogOpen(false);
      setSelectedUserId("");
      setUserSearchOpen(false);
      setAmount("");
      const now = new Date();
      setPaymentDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
      setBillingPeriod("monthly");
      setBillingMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      setYearlyStartMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 12, 1);
      setYearlyEndMonth(`${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`);
      setNotes("");
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Payment submission error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getUserName = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    if (!user) return "Unknown User";
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.email || "User";
  };

  const getUserDisplayName = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    if (!user) return "Unknown User";
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : "User";
  };

  const formatBillingMonth = (billingMonth: string | null) => {
    if (!billingMonth) return "-";
    try {
      const [year, month] = billingMonth.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch {
      return billingMonth;
    }
  };

  const formatYearlyPeriod = (startMonth: string | null, endMonth: string | null) => {
    if (!startMonth || !endMonth) return "-";
    try {
      const start = formatBillingMonth(startMonth);
      const end = formatBillingMonth(endMonth);
      return `${start} - ${end}`;
    } catch {
      return `${startMonth} - ${endMonth}`;
    }
  };

  const getSelectedUserDisplay = () => {
    if (!selectedUserId) return "Select a user...";
    const user = users?.find(u => u.id === selectedUserId);
    if (!user) return "Select a user...";
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.email || "User";
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Payment Tracking</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Record and manage manual payments from various sources
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-record-payment" className="w-full sm:w-auto">
          <DollarSign className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Delinquent Users Section */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-lg sm:text-xl">Delinquent Users</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingDelinquent ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading delinquent users...
            </div>
          ) : !delinquentUsers || delinquentUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Check className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p>All users are up to date with payments</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                {delinquentUsers.length} user{delinquentUsers.length !== 1 ? 's' : ''} with missed payments
              </div>
              <div className="hidden md:block rounded-lg border bg-background overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Missing Months</TableHead>
                      <TableHead>Amount Owed</TableHead>
                      <TableHead>Last Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {delinquentUsers.map((user) => (
                      <TableRow key={user.userId} data-testid={`row-delinquent-${user.userId}`}>
                        <TableCell className="font-medium min-w-[150px]">
                          <div className="space-y-1">
                            <div className="break-words">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : "User"}
                            </div>
                            <PrivacyField 
                              value={user.email || ""} 
                              type="email"
                              testId={`delinquent-email-${user.userId}`}
                              className="text-xs break-words"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {user.missingMonths.map((month) => {
                              const [year, monthNum] = month.split("-");
                              const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                              return (
                                <Badge key={month} variant="outline" className="text-xs">
                                  {date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-amber-700 whitespace-nowrap">
                          {formatCurrency(user.amountOwed)}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {user.lastPaymentDate
                            ? new Date(user.lastPaymentDate).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {delinquentUsers.map((user) => (
                  <Card key={user.userId} data-testid={`row-delinquent-${user.userId}`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium break-words flex-1 min-w-0">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : "User"}
                          </span>
                          <span className="font-mono font-semibold text-amber-700 shrink-0">
                            {formatCurrency(user.amountOwed)}
                          </span>
                        </div>
                        <PrivacyField 
                          value={user.email || ""} 
                          type="email"
                          testId={`delinquent-email-mobile-${user.userId}`}
                          className="text-xs"
                        />
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Missing Months: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.missingMonths.map((month) => {
                            const [year, monthNum] = month.split("-");
                            const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                            return (
                              <Badge key={month} variant="outline" className="text-xs">
                                {date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Last Payment: </span>
                        <span>
                          {user.lastPaymentDate
                            ? new Date(user.lastPaymentDate).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading payments...
            </div>
          ) : !payments || payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments recorded yet
            </div>
          ) : (
            <>
              <div className="hidden md:block rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Billing Month</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                        <TableCell className="font-medium min-w-[150px]">
                          <div className="space-y-1">
                            <div className="break-words">{getUserDisplayName(payment.userId)}</div>
                            <PrivacyField 
                              value={users?.find(u => u.id === payment.userId)?.email || ""} 
                              type="email"
                              testId={`payment-email-${payment.id}`}
                              className="text-xs break-words"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-mono whitespace-nowrap">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="capitalize">{payment.billingPeriod || 'monthly'}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground min-w-[150px]">
                          <span className="break-words">
                            {payment.billingPeriod === "monthly" 
                              ? formatBillingMonth(payment.billingMonth)
                              : payment.billingPeriod === "yearly"
                              ? formatYearlyPeriod(payment.yearlyStartMonth, payment.yearlyEndMonth)
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize whitespace-nowrap">
                          {payment.paymentMethod.replace(/-/g, ' ')}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm min-w-[150px] max-w-[200px]">
                          <span className="break-words line-clamp-2">{payment.notes || "-"}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {payments.map((payment) => (
                  <Card key={payment.id} data-testid={`row-payment-${payment.id}`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium break-words flex-1 min-w-0">{getUserDisplayName(payment.userId)}</span>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-semibold">
                              {formatCurrency(payment.amount)}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground capitalize">
                              {payment.billingPeriod || 'monthly'}
                            </span>
                          </div>
                        </div>
                        <PrivacyField 
                          value={users?.find(u => u.id === payment.userId)?.email || ""} 
                          type="email"
                          testId={`payment-email-mobile-${payment.id}`}
                          className="text-xs"
                        />
                      </div>
                      
                      {payment.billingPeriod === "monthly" && payment.billingMonth && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Billing Month: </span>
                          <span className="break-words">{formatBillingMonth(payment.billingMonth)}</span>
                        </div>
                      )}
                      {payment.billingPeriod === "yearly" && payment.yearlyStartMonth && payment.yearlyEndMonth && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Subscription Period: </span>
                          <span className="break-words">{formatYearlyPeriod(payment.yearlyStartMonth, payment.yearlyEndMonth)}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Method</span>
                          <p className="capitalize">{payment.paymentMethod.replace(/-/g, ' ')}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date</span>
                          <p>{new Date(payment.paymentDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {payment.notes && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Notes: </span>
                          <span className="break-words">{payment.notes}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setUserSearchOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a manual payment received from a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userSearchOpen}
                    className="w-full justify-between"
                    id="user"
                    data-testid="button-select-user"
                  >
                    {getSelectedUserDisplay()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0" align="start">
                  <Command shouldFilter>
                    <CommandInput placeholder="Search users by name or email..." />
                    <CommandList>
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        {users?.map((user) => {
                          const selected = selectedUserId === user.id;
                          const displayName = user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : "User";
                          return (
                            <CommandItem
                              key={user.id}
                              value={`${displayName} ${user.email || ""}`}
                              onSelect={() => {
                                setSelectedUserId(user.id);
                                setUserSearchOpen(false);
                              }}
                              data-testid={`command-user-${user.id}`}
                              className="break-words"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  selected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate">{displayName}</span>
                                <PrivacyField 
                                  value={user.email || ""} 
                                  type="email"
                                  testId={`command-email-${user.id}`}
                                  className="text-xs truncate"
                                />
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                data-testid="input-payment-date"
                required
              />
              <p className="text-xs text-muted-foreground">
                The exact date the customer made this payment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method" data-testid="select-payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon-gift-card">Amazon Gift Card</SelectItem>
                  <SelectItem value="apple-gift-card">Apple Gift Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="walmart-onepay">Walmart OnePay</SelectItem>
                  <SelectItem value="wise">Wise</SelectItem>
                  <SelectItem value="zelle">Zelle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing-period">Billing Period</Label>
              <Select value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as "monthly" | "yearly")}>
                <SelectTrigger id="billing-period" data-testid="select-billing-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {billingPeriod === "monthly" && (
              <div className="space-y-2">
                <Label htmlFor="billing-month">Billing Month</Label>
                <Input
                  id="billing-month"
                  type="month"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  data-testid="input-billing-month"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Select which calendar month this payment is being applied to (not prorated)
                </p>
              </div>
            )}

            {billingPeriod === "yearly" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="yearly-start-month">Subscription Start Month</Label>
                  <Input
                    id="yearly-start-month"
                    type="month"
                    value={yearlyStartMonth}
                    onChange={(e) => setYearlyStartMonth(e.target.value)}
                    data-testid="input-yearly-start-month"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The month and year when the yearly subscription begins
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearly-end-month">Subscription End Month</Label>
                  <Input
                    id="yearly-end-month"
                    type="month"
                    value={yearlyEndMonth}
                    onChange={(e) => setYearlyEndMonth(e.target.value)}
                    data-testid="input-yearly-end-month"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The month and year when the yearly subscription ends (not prorated)
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="input-notes"
                className="resize-none min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => recordPaymentMutation.mutate()}
              disabled={
                !selectedUserId || 
                !amount || 
                !paymentDate ||
                (billingPeriod === "monthly" && !billingMonth) ||
                (billingPeriod === "yearly" && (!yearlyStartMonth || !yearlyEndMonth)) ||
                recordPaymentMutation.isPending
              }
              data-testid="button-submit-payment"
            >
              {recordPaymentMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
