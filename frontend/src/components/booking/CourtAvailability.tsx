import { useState, useEffect } from "react";
import { IndianRupee, Activity, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import courtService, { type Court, type AvailableSlot } from "@/services/court.service";
import { formatSportLabel } from "@/utils/sport-formatter";
import type { Venue } from "@/services/venue.service";

interface CourtAvailabilityProps {
	venue: Venue;
	onSelectSlots: (court: Court, date: Date, slots: AvailableSlot[]) => void;
}

const CourtAvailability = ({ venue, onSelectSlots }: CourtAvailabilityProps) => {
	const [courts, setCourts] = useState<Court[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [availability, setAvailability] = useState<Record<string, AvailableSlot[]>>({});
	const [loadingAvailability, setLoadingAvailability] = useState<string | null>(null);
	const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
	const [selectedSlots, setSelectedSlots] = useState<AvailableSlot[]>([]);

	// Generate next 3 days for booking
	const bookingDates = Array.from({ length: 3 }, (_, i) => addDays(new Date(), i));

	useEffect(() => {
		if (venue._id) {
			fetchCourts();
		}
	}, [venue._id]);

	useEffect(() => {
		if (courts.length > 0 && selectedDate) {
			fetchAvailabilityForAllCourts();
		}
	}, [courts, selectedDate]);

	const fetchCourts = async () => {
		try {
			setLoading(true);
			const fetchedCourts = await courtService.getCourtsByVenue(venue._id!);
			// Filter only active courts
			const activeCourts = fetchedCourts.filter((court) => court.isActive);
			setCourts(activeCourts);
			if (activeCourts.length > 0) {
				setSelectedCourt(activeCourts[0]);
			}
		} catch (error: any) {
			console.error("Error fetching courts:", error);
			toast.error("Failed to fetch courts");
		} finally {
			setLoading(false);
		}
	};

	const fetchAvailabilityForAllCourts = async () => {
		const newAvailability: Record<string, AvailableSlot[]> = {};

		for (const court of courts) {
			try {
				setLoadingAvailability(court._id!);
				const result = await courtService.getCourtAvailability(venue._id!, court._id!, {
					startDate: selectedDate.toISOString(),
				});
				// Get the slots for the selected date
				const dateKey = selectedDate.toISOString().split("T")[0];
				const slots = result.availability?.[dateKey] || [];
				newAvailability[court._id!] = slots;
			} catch (error) {
				console.error(`Error fetching availability for court ${court.name}:`, error);
				newAvailability[court._id!] = [];
			}
		}

		setAvailability(newAvailability);
		setLoadingAvailability(null);
	};

	const getDateLabel = (date: Date) => {
		if (isToday(date)) return "Today";
		if (isTomorrow(date)) return "Tomorrow";
		return format(date, "EEE, MMM d");
	};

	const handleSlotSelection = (slot: AvailableSlot) => {
		if (!slot.isAvailable) return;

		const slotIndex = selectedSlots.findIndex((s) => s.startTime === slot.startTime && s.endTime === slot.endTime);

		let newSelectedSlots: AvailableSlot[];

		if (slotIndex > -1) {
			// Deselect slot
			newSelectedSlots = selectedSlots.filter((_, index) => index !== slotIndex);
		} else {
			// Check if we can add this slot (max 4 consecutive slots)
			if (selectedSlots.length >= 4) {
				toast.error("You can book a maximum of 4 consecutive slots");
				return;
			}

			// Check if slot is consecutive with selected slots
			if (selectedSlots.length > 0) {
				const isConsecutive = selectedSlots.some((s) => s.endTime === slot.startTime || slot.endTime === s.startTime);

				if (!isConsecutive) {
					toast.error("Please select consecutive slots only");
					return;
				}
			}

			newSelectedSlots = [...selectedSlots, slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
		}

		setSelectedSlots(newSelectedSlots);
	};

	const getTotalPrice = () => {
		return selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
	};

	const handleProceedToBooking = () => {
		if (selectedSlots.length === 0) {
			toast.error("Please select at least one slot");
			return;
		}

		if (!selectedCourt) {
			toast.error("Please select a court");
			return;
		}

		onSelectSlots(selectedCourt, selectedDate, selectedSlots);
	};

	const isSlotSelected = (slot: AvailableSlot) => {
		return selectedSlots.some((s) => s.startTime === slot.startTime && s.endTime === slot.endTime);
	};

	const isSlotSelectable = (slot: AvailableSlot) => {
		if (!slot.isAvailable) return false;
		if (selectedSlots.length === 0) return true;
		if (selectedSlots.length >= 4) return false;

		// Check if consecutive
		return selectedSlots.some((s) => s.endTime === slot.startTime || slot.endTime === s.startTime);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (courts.length === 0) {
		return (
			<Card>
				<CardContent className="text-center py-8">
					<p className="text-muted-foreground">No courts available for booking at this venue</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Date Selection */}
			<div>
				<h3 className="text-lg font-semibold mb-3">Select Date</h3>
				<div className="flex gap-2">
					{bookingDates.map((date) => (
						<Button
							key={date.toISOString()}
							variant={selectedDate.toDateString() === date.toDateString() ? "default" : "outline"}
							onClick={() => {
								setSelectedDate(date);
								setSelectedSlots([]);
							}}
							className="flex-1"
						>
							<div className="text-center">
								<p className="font-semibold">{getDateLabel(date)}</p>
								<p className="text-xs opacity-75">{format(date, "MMM d")}</p>
							</div>
						</Button>
					))}
				</div>
			</div>

			{/* Court Selection */}
			<div>
				<h3 className="text-lg font-semibold mb-3">Select Court</h3>
				<Tabs
					value={selectedCourt?._id}
					onValueChange={(value) => {
						const court = courts.find((c) => c._id === value);
						setSelectedCourt(court || null);
						setSelectedSlots([]);
					}}
				>
					<TabsList
						className="grid w-full"
						style={{ gridTemplateColumns: `repeat(${Math.min(courts.length, 4)}, 1fr)` }}
					>
						{courts.map((court) => (
							<TabsTrigger key={court._id} value={court._id!}>
								<div className="text-center">
									<p className="font-medium">{court.name}</p>
									<p className="text-xs opacity-75">{formatSportLabel(court.sportType)}</p>
								</div>
							</TabsTrigger>
						))}
					</TabsList>

					{courts.map((court) => (
						<TabsContent key={court._id} value={court._id!} className="mt-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-base flex items-center justify-between">
										<span className="flex items-center gap-2">
											<Activity className="h-4 w-4" />
											{court.name} - {formatSportLabel(court.sportType)}
										</span>
										{court.description && (
											<span className="text-sm font-normal text-muted-foreground">{court.description}</span>
										)}
									</CardTitle>
								</CardHeader>
								<CardContent>
									{/* Available Slots */}
									<div className="space-y-3">
										<p className="text-sm text-muted-foreground">Select up to 4 consecutive slots</p>

										{loadingAvailability === court._id ? (
											<div className="flex items-center justify-center py-8">
												<Loader2 className="h-6 w-6 animate-spin" />
											</div>
										) : availability[court._id!]?.length > 0 ? (
											<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
												{availability[court._id!].map((slot, index) => {
													const selected = isSlotSelected(slot);
													const selectable = isSlotSelectable(slot);

													return (
														<Button
															key={index}
															variant={selected ? "default" : "outline"}
															size="sm"
															disabled={!slot.isAvailable || (!selected && !selectable)}
															onClick={() => handleSlotSelection(slot)}
															className={`h-auto py-2 px-3 ${!slot.isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
														>
															<div className="text-center w-full">
																<p className="font-medium text-xs">
																	{slot.startTime} - {slot.endTime}
																</p>
																<p className="text-xs opacity-75 mt-1">₹{slot.price}</p>
															</div>
														</Button>
													);
												})}
											</div>
										) : (
											<p className="text-center py-4 text-muted-foreground">No slots available for this date</p>
										)}
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					))}
				</Tabs>
			</div>

			{/* Booking Summary */}
			{selectedSlots.length > 0 && (
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle className="text-base">Booking Summary</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Court</span>
								<span className="font-medium">{selectedCourt?.name}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Date</span>
								<span className="font-medium">{format(selectedDate, "EEE, MMM d, yyyy")}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Time</span>
								<span className="font-medium">
									{selectedSlots[0]?.startTime} - {selectedSlots[selectedSlots.length - 1]?.endTime}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Duration</span>
								<span className="font-medium">{selectedSlots.length} hour(s)</span>
							</div>
						</div>

						<Separator />

						<div className="flex justify-between items-center">
							<span className="font-semibold">Total Amount</span>
							<span className="text-xl font-bold flex items-center">
								<IndianRupee className="h-5 w-5" />
								{getTotalPrice()}
							</span>
						</div>

						<Button
							onClick={handleProceedToBooking}
							className="w-full gradient-primary text-primary-foreground"
							size="lg"
						>
							Proceed to Booking
							<ChevronRight className="ml-2 h-4 w-4" />
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default CourtAvailability;
