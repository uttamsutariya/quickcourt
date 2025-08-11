import { Calendar, Clock, Edit, IndianRupee, MoreVertical, Trash2, Activity, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Court } from "@/services/court.service";
import { DayOfWeek } from "@/types/enums";
import { formatSportLabel } from "@/utils/sport-formatter";

interface CourtCardProps {
	court: Court;
	onEdit: (court: Court) => void;
	onDelete: (court: Court) => void;
	onManageSchedule: (court: Court) => void;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
	[DayOfWeek.MONDAY]: "Mon",
	[DayOfWeek.TUESDAY]: "Tue",
	[DayOfWeek.WEDNESDAY]: "Wed",
	[DayOfWeek.THURSDAY]: "Thu",
	[DayOfWeek.FRIDAY]: "Fri",
	[DayOfWeek.SATURDAY]: "Sat",
	[DayOfWeek.SUNDAY]: "Sun",
};

const CourtCard = ({ court, onEdit, onDelete, onManageSchedule }: CourtCardProps) => {
	// Get open days
	const openDays = court.slotConfigurations.filter((config) => config.isOpen);
	const allDaysOpen = openDays.length === 7;

	// Get price range
	const prices = court.slotConfigurations.filter((c) => c.isOpen).map((c) => c.price || court.defaultPrice);
	const minPrice = prices.length > 0 ? Math.min(...prices) : court.defaultPrice;
	const maxPrice = prices.length > 0 ? Math.max(...prices) : court.defaultPrice;
	const priceRange = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

	// Get operating hours range
	const getOperatingHours = () => {
		const openConfigs = court.slotConfigurations.filter((c) => c.isOpen);
		if (openConfigs.length === 0) return "Not configured";

		const startTimes = openConfigs.map((c) => c.startTime);
		const endTimes = openConfigs.map((c) => {
			const [h, m] = c.startTime.split(":").map(Number);
			const endHour = h + c.slotDuration * c.numberOfSlots;
			return `${endHour}:${m.toString().padStart(2, "0")}`;
		});

		const earliestStart = startTimes.sort()[0];
		const latestEnd = endTimes.sort().reverse()[0];

		return `${earliestStart} - ${latestEnd}`;
	};

	return (
		<div className="bg-card border rounded-lg p-4 hover:shadow-md transition-all hover:border-primary/30">
			{/* Header */}
			<div className="flex items-start justify-between mb-3">
				<div className="flex-1">
					<h3 className="font-semibold text-base flex items-center gap-2">
						{court.name}
						{court.isActive && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
					</h3>
					<Badge variant="secondary" className="mt-1 text-xs">
						<Activity className="h-3 w-3 mr-1" />
						{formatSportLabel(court.sportType)}
					</Badge>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-7 w-7">
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-44">
						<DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => onManageSchedule(court)} className="text-xs">
							<Calendar className="mr-2 h-3.5 w-3.5" />
							Manage Schedule
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onEdit(court)} className="text-xs">
							<Edit className="mr-2 h-3.5 w-3.5" />
							Edit Court
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => onDelete(court)}
							className="text-destructive focus:text-destructive text-xs"
						>
							<Trash2 className="mr-2 h-3.5 w-3.5" />
							Delete Court
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Description */}
			{court.description && <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{court.description}</p>}

			{/* Info Grid */}
			<div className="space-y-2 text-xs">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground flex items-center gap-1">
						<Clock className="h-3 w-3" />
						Hours
					</span>
					<span className="font-medium">{getOperatingHours()}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground flex items-center gap-1">
						<IndianRupee className="h-3 w-3" />
						Price
					</span>
					<span className="font-medium">{priceRange}</span>
				</div>
			</div>

			{/* Open Days */}
			<div className="mt-3 pt-3 border-t">
				<p className="text-xs text-muted-foreground mb-2">Open Days</p>
				{allDaysOpen ? (
					<Badge variant="outline" className="text-xs">
						All days open
					</Badge>
				) : openDays.length === 0 ? (
					<Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600/30">
						Schedule not configured
					</Badge>
				) : (
					<div className="flex gap-1 flex-wrap">
						{Object.values(DayOfWeek).map((day) => {
							const isOpen = openDays.some((config) => config.dayOfWeek === day);
							return (
								<span
									key={day}
									className={`inline-flex items-center justify-center w-8 h-6 text-xs rounded ${
										isOpen ? "bg-primary/10 text-primary font-medium" : "bg-muted text-muted-foreground/50"
									}`}
								>
									{DAY_LABELS[day]}
								</span>
							);
						})}
					</div>
				)}
			</div>

			{/* Action Button */}
			<Button onClick={() => onManageSchedule(court)} className="w-full mt-3 h-8 text-xs" variant="outline" size="sm">
				<Calendar className="mr-1.5 h-3.5 w-3.5" />
				Manage Schedule
			</Button>
		</div>
	);
};

export default CourtCard;
