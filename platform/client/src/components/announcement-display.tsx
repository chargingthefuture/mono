import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info, Wrench, Bell, Megaphone } from "lucide-react";
import { format } from "date-fns";

export interface AnnouncementDisplayProps {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string | Date;
  expiresAt?: string | Date | null;
  showExpiration?: boolean;
  testId?: string;
}

export function AnnouncementDisplay({
  id,
  title,
  content,
  type,
  createdAt,
  expiresAt,
  showExpiration = true,
  testId,
}: AnnouncementDisplayProps) {
  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "maintenance":
        return <Wrench className="w-5 h-5 text-blue-600" />;
      case "update":
        return <Bell className="w-5 h-5 text-green-600" />;
      case "promotion":
        return <Megaphone className="w-5 h-5 text-purple-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAnnouncementBadgeVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "destructive" as const;
      case "maintenance":
        return "secondary" as const;
      case "update":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <Card key={id} data-testid={testId || `announcement-${id}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {getAnnouncementIcon(type)}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg mb-2">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getAnnouncementBadgeVariant(type)} className="text-xs">
                {type}
              </Badge>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {format(new Date(createdAt), "MMM d, yyyy")}
              </span>
              {showExpiration && expiresAt && (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Expires: {format(new Date(expiresAt), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="whitespace-pre-wrap">
          {content}
        </CardDescription>
      </CardContent>
    </Card>
  );
}








