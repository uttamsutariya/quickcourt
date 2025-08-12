import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, MapPin, Image, CheckCircle, Home, Trees, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ImageUpload from "@/components/owner/ImageUpload";
import venueService, { type Venue } from "@/services/venue.service";
import { VenueType } from "@/types/enums";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { SPORTS_FORM_OPTIONS } from "@/config/sports";

// Use centralized sports configuration to ensure consistency
const SPORTS_OPTIONS = SPORTS_FORM_OPTIONS;

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

const CreateVenue = () => {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [submitting, setSubmitting] = useState(false);

	const [formData, setFormData] = useState<Partial<Venue>>({
		name: "",
		description: "",
		venueType: VenueType.BOTH,
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

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateStep = (step: number): boolean => {
		const newErrors: Record<string, string> = {};

		switch (step) {
			case 1:
				if (!formData.name?.trim()) newErrors.name = "Venue name is required";
				if (formData.name?.trim().length && formData.name?.trim().length < 3)
					newErrors.name = "Venue name must be at least 3 characters long";
				if (!formData.description?.trim()) newErrors.description = "Description is required";
				if (formData.description?.trim().length && formData.description?.trim().length < 10)
					newErrors.description = "Description must be at least 10 characters long";
				if (!formData.venueType) newErrors.venueType = "Venue type is required";
				break;
			case 2:
				if (!formData.address?.street?.trim()) newErrors.street = "Street address is required";
				if (!formData.address?.city?.trim()) newErrors.city = "City is required";
				if (!formData.address?.state?.trim()) newErrors.state = "State is required";
				if (!formData.address?.zipCode?.trim()) newErrors.zipCode = "ZIP code is required";
				break;
			case 3:
				if (formData.sports?.length === 0) newErrors.sports = "Select at least one sport";
				break;
			case 4:
				// Images are optional
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (validateStep(currentStep)) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		setCurrentStep(currentStep - 1);
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

	const handleSubmit = async () => {
		if (!validateStep(currentStep)) return;

		setSubmitting(true);
		try {
			const response = await venueService.createVenue(formData);
			toast.success(response.message || "Venue created successfully!");
			navigate("/owner/venues");
		} catch (error: any) {
			console.error("Create venue error:", error);
			toast.error(error.message || "Failed to create venue");
		} finally {
			setSubmitting(false);
		}
	};

	const steps = [
		{ number: 1, title: "Basic Info", icon: MapPin },
		{ number: 2, title: "Address", icon: MapPin },
		{ number: 3, title: "Sports & Amenities", icon: CheckCircle },
		{ number: 4, title: "Images", icon: Image },
	];

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			{/* Header */}
			<div className="mb-8">
				<Button variant="ghost" onClick={() => navigate("/owner/venues")} className="mb-4">
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back to Venues
				</Button>
				<h1 className="text-3xl font-bold">Add New Venue</h1>
				<p className="text-muted-foreground mt-2">
					Create a new sports facility listing. It will be reviewed by admin before going live.
				</p>
			</div>

			{/* Progress Steps */}
			<div className="mb-8">
				<div className="flex items-center justify-between">
					{steps.map((step, index) => (
						<div key={step.number} className="flex items-center flex-1">
							<div
								className={cn(
									"flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
									currentStep >= step.number
										? "bg-primary border-primary text-primary-foreground"
										: "border-muted-foreground text-muted-foreground",
								)}
							>
								{currentStep > step.number ? (
									<CheckCircle className="h-5 w-5" />
								) : (
									<span className="text-sm font-semibold">{step.number}</span>
								)}
							</div>
							{index < steps.length - 1 && (
								<div
									className={cn(
										"flex-1 h-1 mx-2 transition-colors",
										currentStep > step.number ? "bg-primary" : "bg-muted",
									)}
								/>
							)}
						</div>
					))}
				</div>
				<div className="flex justify-between mt-2">
					{steps.map((step) => (
						<div key={step.number} className="flex-1 text-center">
							<p className="text-xs text-muted-foreground">{step.title}</p>
						</div>
					))}
				</div>
			</div>

			{/* Form Steps */}
			<Card>
				<CardHeader>
					<CardTitle>{steps[currentStep - 1].title}</CardTitle>
					<CardDescription>
						{currentStep === 1 && "Enter the basic information about your venue"}
						{currentStep === 2 && "Provide the complete address of your venue"}
						{currentStep === 3 && "Select the sports and amenities available at your venue"}
						{currentStep === 4 && "Upload images of your venue (optional but recommended)"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Step 1: Basic Info */}
					{currentStep === 1 && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Venue Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder="e.g., Sports Arena Mumbai"
								/>
								{errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description *</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="Describe your venue, facilities, and what makes it special..."
									rows={5}
								/>
								{errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
							</div>

							<div className="space-y-2">
								<Label>Venue Type *</Label>
								<RadioGroup
									value={formData.venueType}
									onValueChange={(value) => setFormData({ ...formData, venueType: value as VenueType })}
									className="grid grid-cols-3 gap-4"
								>
									<div className="flex items-start space-x-2">
										<RadioGroupItem value={VenueType.INDOOR} id="indoor" className="mt-1" />
										<Label htmlFor="indoor" className="cursor-pointer">
											<div className="flex items-center gap-2">
												<Home className="h-4 w-4" />
												<div>
													<p className="font-medium">Indoor</p>
													<p className="text-xs text-muted-foreground">Covered facilities</p>
												</div>
											</div>
										</Label>
									</div>
									<div className="flex items-start space-x-2">
										<RadioGroupItem value={VenueType.OUTDOOR} id="outdoor" className="mt-1" />
										<Label htmlFor="outdoor" className="cursor-pointer">
											<div className="flex items-center gap-2">
												<Trees className="h-4 w-4" />
												<div>
													<p className="font-medium">Outdoor</p>
													<p className="text-xs text-muted-foreground">Open-air facilities</p>
												</div>
											</div>
										</Label>
									</div>
									<div className="flex items-start space-x-2">
										<RadioGroupItem value={VenueType.BOTH} id="both" className="mt-1" />
										<Label htmlFor="both" className="cursor-pointer">
											<div className="flex items-center gap-2">
												<Building2 className="h-4 w-4" />
												<div>
													<p className="font-medium">Both</p>
													<p className="text-xs text-muted-foreground">Mixed facilities</p>
												</div>
											</div>
										</Label>
									</div>
								</RadioGroup>
								{errors.venueType && <p className="text-sm text-destructive">{errors.venueType}</p>}
							</div>
						</div>
					)}

					{/* Step 2: Address */}
					{currentStep === 2 && (
						<div className="space-y-4">
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
								/>
								{errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
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
									/>
									{errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
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
									/>
									{errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
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
									/>
									{errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode}</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="country">Country</Label>
									<Input id="country" value={formData.address?.country} disabled placeholder="India" />
								</div>
							</div>
						</div>
					)}

					{/* Step 3: Sports & Amenities */}
					{currentStep === 3 && (
						<div className="space-y-6">
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
								{errors.sports && <p className="text-sm text-destructive">{errors.sports}</p>}
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
						</div>
					)}

					{/* Step 4: Images */}
					{currentStep === 4 && (
						<div className="space-y-4">
							<div>
								<Label>Venue Images</Label>
								<p className="text-sm text-muted-foreground mt-1">
									Upload up to 10 images of your venue. The first image will be used as the primary display image.
								</p>
							</div>
							<ImageUpload
								images={formData.images || []}
								onImagesChange={(images) => setFormData({ ...formData, images })}
								maxImages={10}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Navigation Buttons */}
			<div className="flex justify-between mt-6">
				<Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || submitting}>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Previous
				</Button>

				{currentStep < 4 ? (
					<Button onClick={handleNext}>
						Next
						<ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				) : (
					<Button onClick={handleSubmit} disabled={submitting} className="gradient-primary text-primary-foreground">
						{submitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating Venue...
							</>
						) : (
							"Create Venue"
						)}
					</Button>
				)}
			</div>
		</div>
	);
};

export default CreateVenue;
