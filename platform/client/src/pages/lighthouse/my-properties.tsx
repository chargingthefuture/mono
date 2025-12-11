import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Home, MapPin, DollarSign, Plus } from "lucide-react";
import type { LighthouseProperty } from "@shared/schema";

export default function MyPropertiesPage() {
  const { data: properties, isLoading } = useQuery<LighthouseProperty[]>({
    queryKey: ["/api/lighthouse/my-properties"],
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Home className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">
              My Properties
            </h1>
            <p className="text-muted-foreground">
              Manage your housing listings
            </p>
          </div>
        </div>
        <Link href="/apps/lighthouse/property/new">
          <Button data-testid="button-create-property">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {!properties || properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">You haven't listed any properties yet.</p>
            <Link href="/apps/lighthouse/property/new">
              <Button data-testid="button-create-first-property">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="hover-elevate" data-testid={`property-card-${property.id}`}>
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
                  <Badge className={getPropertyTypeColor(property.propertyType)}>
                    {formatPropertyType(property.propertyType)}
                  </Badge>
                  {property.monthlyRent && (
                    <div className="flex items-center gap-1 text-sm font-medium text-primary">
                      <DollarSign className="w-4 h-4" />
                      {property.monthlyRent}/mo
                    </div>
                  )}
                  <Badge variant={property.isActive ? "default" : "outline"}>
                    {property.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {property.city}, {property.state}
                </div>
                <div className="flex gap-2">
                  <Link href={`/apps/lighthouse/property/edit/${property.id}`}>
                    <Button variant="outline" size="sm" data-testid={`button-edit-${property.id}`}>
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/apps/lighthouse/property/${property.id}`}>
                    <Button variant="outline" size="sm" data-testid={`button-view-${property.id}`}>
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
