import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, MapPin, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSportLabel } from "@/utils/sport-formatter";
import type { Venue } from "@/services/venue.service";

interface VenueCardProps {
	venue: Venue;
	onDelete: (venue: Venue) => void;
}

const VenueCard = ({ venue, onDelete }: VenueCardProps) => {
	const navigate = useNavigate();

	const getStatusBadge = (status?: string) => {
		switch (status) {
			case "pending":
				return (
					<Badge variant="secondary" className="absolute top-2 right-2">
						Pending
					</Badge>
				);
			case "approved":
				return <Badge className="absolute top-2 right-2 bg-green-500/90 hover:bg-green-500">Approved</Badge>;
			case "rejected":
				return (
					<Badge variant="destructive" className="absolute top-2 right-2">
						Rejected
					</Badge>
				);
			default:
				return null;
		}
	};

	return (
		<Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50">
			{/* Image Section */}
			<div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
				{venue.images && venue.images.length > 0 ? (
					<>
						<img
							src={venue.images[0]}
							alt={venue.name}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.style.display = "none";
								const fallback = target.nextElementSibling as HTMLElement;
								if (fallback) fallback.style.display = "flex";
							}}
						/>
						<div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
							<Building2 className="h-12 w-12 text-primary/30" />
						</div>
					</>
				) : (
					<div className="absolute inset-0 flex items-center justify-center">
						<Building2 className="h-12 w-12 text-primary/30" />
					</div>
				)}
				{getStatusBadge(venue.status)}

				{/* Gradient Overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			</div>

			{/* Content */}
			<CardHeader className="pb-3">
				<div className="space-y-1">
					<h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
						{venue.name}
					</h3>
					<div className="flex items-center text-sm text-muted-foreground">
						<MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
						<span className="line-clamp-1">
							{venue.address.city}, {venue.address.state}
						</span>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pb-3">
				<p className="text-sm text-muted-foreground line-clamp-2 mb-3">{venue.description}</p>

				{/* Sports Tags */}
				<div className="flex flex-wrap gap-1">
					{venue.sports.slice(0, 3).map((sport) => (
						<Badge key={sport} variant="outline" className="text-xs">
							{formatSportLabel(sport)}
						</Badge>
					))}
					{venue.sports.length > 3 && (
						<Badge variant="outline" className="text-xs">
							+{venue.sports.length - 3}
						</Badge>
					)}
				</div>
			</CardContent>

			{/* Footer */}
			<CardFooter className="pt-3 border-t">
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center text-xs text-muted-foreground">
						<Clock className="h-3 w-3 mr-1" />
						<span>{new Date(venue.createdAt!).toLocaleDateString()}</span>
					</div>
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => navigate(`/owner/venues/${venue._id}`)}
							title="View Details"
						>
							<Eye className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => navigate(`/owner/venues/${venue._id}/edit`)}
							title="Edit Venue"
						>
							<Edit className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:text-destructive"
							onClick={() => onDelete(venue)}
							title="Delete Venue"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
};

export default VenueCard;
