import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Home, MapPin, BedDouble, DollarSign } from "lucide-react";
import type { LighthouseProperty } from "@shared/schema";

export default function BrowsePropertiesPage() {
  const { data: properties, isLoading } = useQuery<LighthouseProperty[]>({
    queryKey: ["/api/lighthouse/properties"],
  });

  const getPropertyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      room: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      apartment: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      community: "bg-green-500/10 text-green-700 dark:text-green-400",
      rv_camper: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    };
    return colors[type] || "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  };

  const formatPropertyType = (type: string) => {
    const labels: Record<string, string> = {
      room: "Private Room",
      apartment: "Full Apartment",
      community: "Community Housing",
      rv_camper: "RV/Camper",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Home className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">
              Browse Housing
            </h1>
            <p className="text-muted-foreground">
              Find safe, affordable housing options
            </p>
          </div>
        </div>
      </div>

      {!properties || properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No housing options available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link key={property.id} href={`/apps/lighthouse/property/${property.id}`}>
              <Card className="hover-elevate h-full" data-testid={`property-card-${property.id}`}>
                {property.photos && property.photos.length > 0 && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img 
                      src={property.photos[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getPropertyTypeColor(property.propertyType)} data-testid={`badge-type-${property.id}`}>
                      {formatPropertyType(property.propertyType)}
                    </Badge>
                    {property.monthlyRent && (
                      <div className="flex items-center gap-1 text-sm font-medium text-primary">
                        <DollarSign className="w-4 h-4" />
                        {property.monthlyRent}/mo
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CardDescription className="line-clamp-2">
                    {property.description}
                  </CardDescription>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {property.city}, {property.state}
                  </div>
                  {property.bedrooms && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <BedDouble className="w-4 h-4" />
                      {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
