import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, MapPin, Clock, Building2, AlertCircle } from "lucide-react";
import { formatSportLabel } from "@/utils/sport-formatter";
import type { Venue } from "@/services/venue.service";

interface VenueCardProps {
	venue: Venue;
	onDelete: (venue: Venue) => void;
}

const VenueCard = ({ venue, onDelete }: VenueCardProps) => {
	const navigate = useNavigate();

	const getStatusStyles = (status?: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-500/90 text-white border-yellow-600";
			case "approved":
				return "bg-green-500/90 text-white border-green-600";
			case "rejected":
				return "bg-red-500/90 text-white border-red-600";
			default:
				return "";
		}
	};

	const getStatusLabel = (status?: string) => {
		switch (status) {
			case "pending":
				return "Pending";
			case "approved":
				return "Approved";
			case "rejected":
				return "Rejected";
			default:
				return "";
		}
	};

	return (
		<div className="group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
			{/* Image Section with fixed aspect ratio */}
			<div className="relative w-full h-48 bg-muted overflow-hidden">
				{venue.images && venue.images.length > 0 ? (
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
				) : null}

				{/* Fallback or error state */}
				<div
					className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 ${
						venue.images && venue.images.length > 0 ? "hidden" : ""
					}`}
				>
					<Building2 className="h-12 w-12 text-muted-foreground/30" />
				</div>

				{/* Status Badge */}
				{venue.status && (
					<div
						className={`absolute top-2 right-2 px-2.5 py-1 rounded-md text-xs font-semibold border backdrop-blur-sm ${getStatusStyles(
							venue.status,
						)}`}
					>
						{getStatusLabel(venue.status)}
					</div>
				)}

				{/* Hover Overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
			</div>

			{/* Content */}
			<div className="p-4 space-y-3">
				{/* Title and Location */}
				<div>
					<h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
						{venue.name}
					</h3>
					<div className="flex items-center mt-1 text-sm text-muted-foreground">
						<MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
						<span className="line-clamp-1">
							{venue.address.city}, {venue.address.state}
						</span>
					</div>
				</div>

				{/* Rejection Notice */}
				{venue.status === "rejected" && venue.rejectionReason && (
					<div className="flex items-start gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
						<AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
						<div className="flex-1">
							<p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Admin Feedback:</p>
							<p className="text-xs text-muted-foreground line-clamp-2">{venue.rejectionReason}</p>
						</div>
					</div>
				)}

				{/* Description */}
				<p className="text-sm text-muted-foreground line-clamp-2">{venue.description}</p>

				{/* Sports Tags */}
				<div className="flex flex-wrap gap-1">
					{venue.sports.slice(0, 3).map((sport) => (
						<span
							key={sport}
							className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
						>
							{formatSportLabel(sport)}
						</span>
					))}
					{venue.sports.length > 3 && (
						<span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
							+{venue.sports.length - 3}
						</span>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between pt-3 border-t">
					<div className="flex items-center text-xs text-muted-foreground">
						<Clock className="h-3 w-3 mr-1" />
						<span>{new Date(venue.createdAt!).toLocaleDateString()}</span>
					</div>
					<div className="flex gap-1">
						<button
							className="p-1.5 rounded-md hover:bg-accent transition-colors"
							onClick={() => navigate(`/owner/venues/${venue._id}`)}
							title="View Details"
						>
							<Eye className="h-4 w-4" />
						</button>
						<button
							className="p-1.5 rounded-md hover:bg-accent transition-colors"
							onClick={() => navigate(`/owner/venues/${venue._id}/edit`)}
							title="Edit Venue"
						>
							<Edit className="h-4 w-4" />
						</button>
						<button
							className="p-1.5 rounded-md hover:bg-accent hover:text-destructive transition-colors"
							onClick={() => onDelete(venue)}
							title="Delete Venue"
						>
							<Trash2 className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VenueCard;
