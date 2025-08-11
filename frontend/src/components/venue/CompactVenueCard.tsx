import { MapPin, Star, IndianRupee, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CompactVenueCardProps {
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
}

const CompactVenueCard = ({ venue, className }: CompactVenueCardProps) => {
	const navigate = useNavigate();

	const handleViewDetails = () => {
		navigate(`/venues/${venue._id}`);
	};

	return (
		<div
			className={cn(
				"group relative bg-card rounded-xl overflow-hidden border border-border/50 transition-all duration-300",
				"hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer",
				className,
			)}
			onClick={handleViewDetails}
		>
			{/* Image Section with Gradient Overlay */}
			<div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
				{venue.images && venue.images.length > 0 ? (
					<>
						<img
							src={venue.images[0]}
							alt={venue.name}
							className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
						/>
						{/* Gradient Overlay */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
					</>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
						<MapPin className="h-12 w-12 text-muted-foreground/30" />
					</div>
				)}

				{/* Price Badge */}
				{venue.startingPrice && (
					<div className="absolute top-2 right-2">
						<div className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground shadow-lg">
							<div className="flex items-center gap-1">
								<IndianRupee className="h-3 w-3" />
								<span className="text-sm font-bold">{venue.startingPrice}</span>
								<span className="text-xs opacity-90">/hr</span>
							</div>
							<div className="text-[10px] opacity-80">Starting from</div>
						</div>
					</div>
				)}

				{/* Rating Badge */}
				{venue.averageRating && (
					<div className="absolute bottom-2 left-2">
						<div className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm flex items-center gap-1">
							<Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
							<span className="text-xs font-semibold">{venue.averageRating.toFixed(1)}</span>
							{venue.totalReviews && <span className="text-xs text-muted-foreground">({venue.totalReviews})</span>}
						</div>
					</div>
				)}
			</div>

			{/* Content Section */}
			<div className="p-3 space-y-2">
				{/* Title */}
				<h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
					{venue.name}
				</h3>

				{/* Location */}
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<MapPin className="h-3 w-3 flex-shrink-0" />
					<span className="line-clamp-1">
						{venue.address.city}, {venue.address.state}
					</span>
				</div>

				{/* Sports Tags */}
				<div className="flex flex-wrap gap-1">
					{venue.sports.slice(0, 2).map((sport) => (
						<span key={sport} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
							{sport}
						</span>
					))}
					{venue.sports.length > 2 && (
						<span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground font-medium">
							+{venue.sports.length - 2}
						</span>
					)}
				</div>

				{/* Quick Info */}
				<div className="flex items-center justify-between pt-1">
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						{venue.amenities && venue.amenities.length > 0 && (
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								<span>{venue.amenities.length} amenities</span>
							</div>
						)}
					</div>

					{/* View Details Link */}
					<div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
						<span>View</span>
						<ArrowRight className="h-3 w-3" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default CompactVenueCard;
