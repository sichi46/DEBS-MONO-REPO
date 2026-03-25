import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Calendar,
  DollarSign,
  Users,
  ArrowLeft,
  CreditCard,
  FileText,
} from "lucide-react";
import { usePolicyDetails } from "../hooks/usePolicies";
import type {
  PolicyStatus,
  PaymentStatus,
  Beneficiary,
  PaymentRecord,
} from "../types";

function getStatusVariant(
  status: PolicyStatus | PaymentStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
    case "PAID":
      return "default";
    case "PENDING":
      return "secondary";
    case "EXPIRED":
    case "FAILED":
      return "destructive";
    default:
      return "outline";
  }
}

function DetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PolicyDetailsPage() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const navigate = useNavigate();
  const {
    data: policy,
    isLoading,
    error,
  } = usePolicyDetails(policyNumber || "");

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive">
          Failed to load policy details. Please try again later.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <DetailsSkeleton />;
  }

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium">Policy not found</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/dashboard/policies">Back to Policies</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="policy-details-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard/policies")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Policies
          </Button>
          <div>
            <p className="text-muted-foreground">
              Policy #{policy.policyNumber}
            </p>
          </div>
        </div>
        <Badge
          variant={getStatusVariant(policy.status)}
          className="text-sm px-3 py-1"
        >
          {policy.status}
        </Badge>
      </div>

      {/* Key Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {policy.policyType?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Coverage Amount</span>
              </div>
              <p className="text-2xl font-bold">{policy.coverageAmount}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Premium</span>
              </div>
              <p className="text-2xl font-bold">
                {policy.premiumAmount}
                <span className="text-sm font-normal text-muted-foreground">
                  /{policy.paymentFrequency.toLowerCase()}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Start Date</span>
              </div>
              <p className="text-lg font-medium">{policy.startDate}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">End Date</span>
              </div>
              <p className="text-lg font-medium">{policy.endDate}</p>
            </div>
          </div>

          {policy.description && (
            <p className="mt-6 text-muted-foreground border-t pt-4">
              {policy.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Beneficiaries */}
      {policy.beneficiaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Beneficiaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {policy.beneficiaries.map((beneficiary: Beneficiary) => (
                <div
                  key={beneficiary.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                >
                  <div>
                    <p className="font-medium">{beneficiary.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {beneficiary.relationship}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {beneficiary.percentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">Share</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {policy.paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policy.paymentHistory.map((payment: PaymentRecord) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.method}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button className="flex-1">
          <CreditCard className="mr-2 h-4 w-4" />
          Make a Payment
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link to="/dashboard/claims/new">
            <FileText className="mr-2 h-4 w-4" />
            File a Claim
          </Link>
        </Button>
      </div>
    </div>
  );
}
