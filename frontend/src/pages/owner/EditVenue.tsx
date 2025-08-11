import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, Settings, Building2, Activity, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUpload from "@/components/owner/ImageUpload";
import CourtManagement from "@/components/courts/CourtManagement";
import venueService, { type Venue } from "@/services/venue.service";
import { type Court } from "@/services/court.service";
import { toast } from "sonner";

// Map display names to backend enum values
const SPORTS_OPTIONS = [
	{ value: "cricket", label: "Cricket" },
	{ value: "badminton", label: "Badminton" },
	{ value: "tennis", label: "Tennis" },
	{ value: "table_tennis", label: "Table Tennis" },
	{ value: "football", label: "Football" },
	{ value: "basketball", label: "Basketball" },
	{ value: "volleyball", label: "Volleyball" },
	{ value: "swimming", label: "Swimming" },
	{ value: "squash", label: "Squash" },
	{ value: "hockey", label: "Hockey" },
	{ value: "baseball", label: "Baseball" },
	{ value: "golf", label: "Golf" },
	{ value: "boxing", label: "Boxing" },
	{ value: "gym_fitness", label: "Gym/Fitness" },
	{ value: "yoga", label: "Yoga" },
	{ value: "other", label: "Other" },
];

const AMENITIES_OPTIONS = [
	"Parking",
	"Changing Rooms",
	"Showers",
	"Lockers",
	"Cafeteria",
	"First Aid",
	"Drinking Water",
	"Washrooms",
	"Equipment Rental",
	"Coaching Available",
	"Air Conditioning",
	"Wi-Fi",
];

const EditVenue = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [showCourtManagement, setShowCourtManagement] = useState(false);
	const [venue, setVenue] = useState<Venue | null>(null);
	const [courts, setCourts] = useState<Court[]>([]);
	const [formData, setFormData] = useState<Partial<Venue>>({
		name: "",
		description: "",
		address: {
			street: "",
			city: "",
			state: "",
			zipCode: "",
			country: "India",
		},
		sports: [],
		amenities: [],
		images: [],
	});

	useEffect(() => {
		if (id) {
			fetchVenue();
		}
	}, [id]);

	const fetchVenue = async () => {
		try {
			setLoading(true);
			const response = await venueService.getVenueById(id!);
			setVenue(response.venue);
			setFormData(response.venue);
		} catch (error: any) {
			console.error("Fetch venue error:", error);
			toast.error(error.message || "Failed to fetch venue");
			navigate("/owner/venues");
		} finally {
			setLoading(false);
		}
	};

	const handleSportToggle = (sportValue: string) => {
		const sports = formData.sports || [];
		if (sports.includes(sportValue)) {
			setFormData({
				...formData,
				sports: sports.filter((s) => s !== sportValue),
			});
		} else {
			setFormData({
				...formData,
				sports: [...sports, sportValue],
			});
		}
	};

	const handleAmenityToggle = (amenity: string) => {
		const amenities = formData.amenities || [];
		if (amenities.includes(amenity)) {
			setFormData({
				...formData,
				amenities: amenities.filter((a) => a !== amenity),
			});
		} else {
			setFormData({
				...formData,
				amenities: [...amenities, amenity],
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		if (!formData.name?.trim()) {
			toast.error("Venue name is required");
			return;
		}
		if (!formData.description?.trim()) {
			toast.error("Description is required");
			return;
		}
		if (!formData.sports || formData.sports.length === 0) {
			toast.error("At least one sport must be selected");
			return;
		}

		setSaving(true);
		try {
			await venueService.updateVenue(id!, formData);
			toast.success("Venue updated successfully!");
			navigate(`/owner/venues/${id}`);
		} catch (error: any) {
			console.error("Update venue error:", error);
			toast.error(error.message || "Failed to update venue");
		} finally {
			setSaving(false);
		}
	};

	// Get court statistics
	const getCourtStats = () => {
		const totalCourts = courts.length;
		const sportsCount = [...new Set(courts.map((c) => c.sportType))].length;
		const avgPrice =
			courts.length > 0 ? Math.round(courts.reduce((sum, c) => sum + (c.defaultPrice || 0), 0) / courts.length) : 0;

		return { totalCourts, sportsCount, avgPrice };
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 max-w-4xl">
				<div className="space-y-6">
					<Skeleton className="h-12 w-1/3" />
					<Card>
						<CardHeader>
							<Skeleton className="h-8 w-1/4" />
							<Skeleton className="h-4 w-1/2" />
						</CardHeader>
						<CardContent className="space-y-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-10 w-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			{/* Header */}
			<div className="mb-8">
				<Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
				<h1 className="text-3xl font-bold">Edit Venue</h1>
				<p className="text-muted-foreground mt-2">Update your venue information</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Info */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
						<CardDescription>Update the basic details about your venue</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Venue Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="e.g., Sports Arena Mumbai"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description *</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Describe your venue, facilities, and what makes it special..."
								rows={5}
								required
							/>
						</div>
					</CardContent>
				</Card>

				{/* Address */}
				<Card>
					<CardHeader>
						<CardTitle>Address</CardTitle>
						<CardDescription>Update the venue location</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="street">Street Address *</Label>
							<Input
								id="street"
								value={formData.address?.street}
								onChange={(e) =>
									setFormData({
										...formData,
										address: { ...formData.address!, street: e.target.value },
									})
								}
								placeholder="123 Main Street"
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="city">City *</Label>
								<Input
									id="city"
									value={formData.address?.city}
									onChange={(e) =>
										setFormData({
											...formData,
											address: { ...formData.address!, city: e.target.value },
										})
									}
									placeholder="Mumbai"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="state">State *</Label>
								<Input
									id="state"
									value={formData.address?.state}
									onChange={(e) =>
										setFormData({
											...formData,
											address: { ...formData.address!, state: e.target.value },
										})
									}
									placeholder="Maharashtra"
									required
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="zipCode">ZIP Code *</Label>
								<Input
									id="zipCode"
									value={formData.address?.zipCode}
									onChange={(e) =>
										setFormData({
											...formData,
											address: { ...formData.address!, zipCode: e.target.value },
										})
									}
									placeholder="400001"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="country">Country</Label>
								<Input id="country" value={formData.address?.country} disabled />
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Sports & Amenities */}
				<Card>
					<CardHeader>
						<CardTitle>Sports & Amenities</CardTitle>
						<CardDescription>Select available sports and amenities</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-3">
							<Label>Sports Available *</Label>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
								{SPORTS_OPTIONS.map((sport) => (
									<div key={sport.value} className="flex items-center space-x-2">
										<Checkbox
											id={sport.value}
											checked={formData.sports?.includes(sport.value)}
											onCheckedChange={() => handleSportToggle(sport.value)}
										/>
										<Label htmlFor={sport.value} className="text-sm font-normal cursor-pointer">
											{sport.label}
										</Label>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-3">
							<Label>Amenities</Label>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
								{AMENITIES_OPTIONS.map((amenity) => (
									<div key={amenity} className="flex items-center space-x-2">
										<Checkbox
											id={amenity}
											checked={formData.amenities?.includes(amenity)}
											onCheckedChange={() => handleAmenityToggle(amenity)}
										/>
										<Label htmlFor={amenity} className="text-sm font-normal cursor-pointer">
											{amenity}
										</Label>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Courts Management */}
				<Card>
					<CardHeader>
						<CardTitle>Courts</CardTitle>
						<CardDescription>
							Manage courts for your venue. Each court can have its own schedule and pricing.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Court Statistics */}
						{courts.length > 0 && (
							<div className="grid grid-cols-3 gap-3">
								<div className="bg-muted/50 rounded-lg p-3 text-center">
									<div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
										<Building2 className="h-4 w-4" />
										<span className="text-xs">Total Courts</span>
									</div>
									<p className="text-xl font-semibold">{getCourtStats().totalCourts}</p>
								</div>
								<div className="bg-muted/50 rounded-lg p-3 text-center">
									<div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
										<Activity className="h-4 w-4" />
										<span className="text-xs">Sports</span>
									</div>
									<p className="text-xl font-semibold">{getCourtStats().sportsCount}</p>
								</div>
								<div className="bg-muted/50 rounded-lg p-3 text-center">
									<div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
										<IndianRupee className="h-4 w-4" />
										<span className="text-xs">Avg. Price</span>
									</div>
									<p className="text-xl font-semibold">₹{getCourtStats().avgPrice}</p>
								</div>
							</div>
						)}

						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={() => setShowCourtManagement(true)}
							disabled={!formData.sports || formData.sports.length === 0}
						>
							<Settings className="mr-2 h-4 w-4" />
							Manage Courts
						</Button>
						{(!formData.sports || formData.sports.length === 0) && (
							<p className="text-sm text-muted-foreground mt-2 text-center">
								Please select at least one sport before adding courts
							</p>
						)}
					</CardContent>
				</Card>

				{/* Images */}
				<Card>
					<CardHeader>
						<CardTitle>Venue Images</CardTitle>
						<CardDescription>
							Upload up to 10 images of your venue. The first image will be the primary display image.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ImageUpload
							images={formData.images || []}
							onImagesChange={(images) => setFormData({ ...formData, images })}
							maxImages={10}
						/>
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="flex justify-end gap-4">
					<Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving}>
						Cancel
					</Button>
					<Button type="submit" disabled={saving} className="gradient-primary text-primary-foreground">
						{saving ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save Changes"
						)}
					</Button>
				</div>
			</form>

			{/* Court Management Dialog */}
			{venue && (
				<CourtManagement
					open={showCourtManagement}
					onClose={() => setShowCourtManagement(false)}
					venue={venue}
					onCourtsUpdate={setCourts}
				/>
			)}
		</div>
	);
};

export default EditVenue;
