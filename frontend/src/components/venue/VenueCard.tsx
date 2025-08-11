import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, IndianRupee, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface VenueCardProps {
	venue: {
		_id: string;
		name: string;
		description?: string;
		address: {
			street: string;
			city: string;
			state: string;
			zipCode: string;
		};
		images: string[];
		sports: string[];
		amenities?: string[];
		averageRating?: number;
		totalReviews?: number;
		venueType?: "indoor" | "outdoor" | "both";
		startingPrice?: number | null;
		courtCount?: number;
	};
	className?: string;
	showDescription?: boolean;
}

const VenueCard = ({ venue, className, showDescription = false }: VenueCardProps) => {
	const navigate = useNavigate();

	// Sports list is already an array of strings
	const sportsList = venue.sports;

	const handleViewDetails = () => {
		navigate(`/venues/${venue._id}`);
	};

	return (
		<Card
			className={cn(
				"group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer",
				className,
			)}
			onClick={handleViewDetails}
		>
			{/* Image Section */}
			<div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
				{venue.images && venue.images.length > 0 ? (
					<img
						src={venue.images[0]}
						alt={venue.name}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<div className="text-center space-y-2">
							<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
								<MapPin className="h-8 w-8 text-primary/50" />
							</div>
							<p className="text-xs text-muted-foreground">No image available</p>
						</div>
					</div>
				)}

				{/* Venue Type Badge */}
				{venue.venueType && (
					<div className="absolute top-3 left-3">
						<Badge className="bg-background/90 backdrop-blur-sm">
							{venue.venueType === "both" ? "Indoor & Outdoor" : venue.venueType}
						</Badge>
					</div>
				)}

				{/* Price Badge */}
				{venue.startingPrice && (
					<div className="absolute top-3 right-3">
						<Badge className="bg-primary text-primary-foreground shadow-lg">
							<div className="flex flex-col items-center">
								<div className="flex items-center">
									<IndianRupee className="h-3 w-3 mr-1" />
									<span className="font-bold">{venue.startingPrice}/hr</span>
								</div>
								<span className="text-[10px] opacity-90">Starting from</span>
							</div>
						</Badge>
					</div>
				)}
			</div>

			<CardContent className="p-4 space-y-3">
				{/* Title and Rating */}
				<div className="flex items-start justify-between gap-2">
					<h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
						{venue.name}
					</h3>
					{venue.averageRating && (
						<div className="flex items-center gap-1 text-sm">
							<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
							<span className="font-medium">{venue.averageRating.toFixed(1)}</span>
							{venue.totalReviews && <span className="text-muted-foreground">({venue.totalReviews})</span>}
						</div>
					)}
				</div>

				{/* Description */}
				{showDescription && venue.description && (
					<p className="text-sm text-muted-foreground line-clamp-2">{venue.description}</p>
				)}

				{/* Location */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<MapPin className="h-4 w-4 flex-shrink-0" />
					<span className="line-clamp-1">
						{venue.address.city}, {venue.address.state}
					</span>
				</div>

				{/* Sports */}
				<div className="flex flex-wrap gap-1.5">
					{sportsList.slice(0, 3).map((sport) => (
						<Badge key={sport} variant="secondary" className="text-xs">
							{sport}
						</Badge>
					))}
					{sportsList.length > 3 && (
						<Badge variant="secondary" className="text-xs">
							+{sportsList.length - 3} more
						</Badge>
					)}
				</div>

				{/* Amenities Preview */}
				{venue.amenities && venue.amenities.length > 0 && (
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Clock className="h-3 w-3" />
						<span>{venue.amenities.slice(0, 2).join(" • ")}</span>
						{venue.amenities.length > 2 && <span>• +{venue.amenities.length - 2} more</span>}
					</div>
				)}
			</CardContent>

			<CardFooter className="p-4 pt-0">
				<Button
					variant="ghost"
					className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
					onClick={(e) => {
						e.stopPropagation();
						handleViewDetails();
					}}
				>
					View Details
					<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
				</Button>
			</CardFooter>
		</Card>
	);
};

export default VenueCard;
