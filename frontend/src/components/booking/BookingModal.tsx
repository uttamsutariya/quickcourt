import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Loader2, IndianRupee, Activity, Clock, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import Confetti from "react-confetti";
import courtService, { type Court, type AvailableSlot } from "@/services/court.service";
import bookingService, { type CreateBookingData } from "@/services/booking.service";
import { formatSportLabel } from "@/utils/sport-formatter";
import { SportType } from "@/types/enums";
import type { Venue } from "@/services/venue.service";
import useAuthStore from "@/stores/auth-store";
import { useNavigate } from "react-router-dom";

interface BookingModalProps {
	open: boolean;
	onClose: () => void;
	venue: Venue;
}

type BookingStep = "sport-date" | "court-slots" | "payment";

const BookingModal = ({ open, onClose, venue }: BookingModalProps) => {
	const { user } = useAuthStore();
	const navigate = useNavigate();

	// Step management
	const [currentStep, setCurrentStep] = useState<BookingStep>("sport-date");
	const [processing, setProcessing] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);

	// Step 1: Sport and Date Selection
	const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());

	// Step 2: Court and Slot Selection
	const [courts, setCourts] = useState<Court[]>([]);
	const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
	const [availability, setAvailability] = useState<AvailableSlot[]>([]);
	const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
	const [loadingCourts, setLoadingCourts] = useState(false);

	// Generate next 7 days for booking (matches backend's default maxBookingAdvanceDays)
	// TODO: Consider fetching this from AdminSettings API for dynamic configuration
	const MAX_BOOKING_DAYS = 7;
	const bookingDates = Array.from({ length: MAX_BOOKING_DAYS }, (_, i) => addDays(new Date(), i));

	// Reset state when modal opens/closes
	useEffect(() => {
		if (open) {
			setCurrentStep("sport-date");
			setSelectedSport(null);
			setSelectedDate(new Date());
			setSelectedCourt(null);
			setSelectedSlots([]);
			setCourts([]);
			setAvailability([]);
			setShowConfetti(false);
		}
	}, [open]);

	// Fetch courts when sport and date are selected
	const fetchCourtsAndAvailability = async () => {
		if (!selectedSport || !selectedDate) return;

		setLoadingCourts(true);
		try {
			// Fetch all courts for the venue
			const allCourts = await courtService.getCourtsByVenue(venue._id!);

			// Filter courts by selected sport and active status
			const sportCourts = allCourts.filter((court) => court.sportType === selectedSport && court.isActive);

			setCourts(sportCourts);

			// If courts found, select the first one
			if (sportCourts.length > 0) {
				setSelectedCourt(sportCourts[0]);
				await fetchAvailability(sportCourts[0]);
			}
		} catch (error) {
			console.error("Error fetching courts:", error);
			toast.error("Failed to fetch available courts");
		} finally {
			setLoadingCourts(false);
		}
	};

	// Fetch availability for selected court
	const fetchAvailability = async (court: Court) => {
		if (!court || !selectedDate) return;

		try {
			const result = await courtService.getCourtAvailability(venue._id!, court._id!, {
				startDate: selectedDate.toISOString(),
			});

			const dateKey = selectedDate.toISOString().split("T")[0];
			const slots = result.availability?.[dateKey] || [];
			setAvailability(slots);
		} catch (error) {
			console.error("Error fetching availability:", error);
			setAvailability([]);
		}
	};

	// Handle court selection change
	const handleCourtChange = async (courtId: string) => {
		const court = courts.find((c) => c._id === courtId);
		if (court) {
			setSelectedCourt(court);
			setSelectedSlots([]);
			await fetchAvailability(court);
		}
	};

	// Handle slot selection with max 4 slots validation
	const handleSlotToggle = (slotKey: string) => {
		setSelectedSlots((prev) => {
			if (prev.includes(slotKey)) {
				return prev.filter((s) => s !== slotKey);
			}

			// Check if user is trying to select more than 4 slots
			if (prev.length >= 4) {
				toast.error("You can select a maximum of 4 slots");
				return prev;
			}

			return [...prev, slotKey];
		});
	};

	// Get selected slot details
	const getSelectedSlotDetails = () => {
		return selectedSlots
			.map((slotKey) => {
				const slot = availability.find((s) => `${s.startTime}-${s.endTime}` === slotKey);
				return slot;
			})
			.filter(Boolean) as AvailableSlot[];
	};

	// Calculate total amount
	const calculateTotalAmount = () => {
		const slots = getSelectedSlotDetails();
		return slots.reduce((sum, slot) => sum + slot.price, 0);
	};

	// Get date label
	const getDateLabel = (date: Date) => {
		if (isToday(date)) return "Today";
		if (isTomorrow(date)) return "Tomorrow";
		return format(date, "EEE, MMM d");
	};

	// Handle booking confirmation
	const handleConfirmBooking = async () => {
		if (!user) {
			toast.error("Please login to book a court");
			navigate("/auth/login");
			return;
		}

		if (!selectedCourt || selectedSlots.length === 0) {
			toast.error("Please select a court and time slots");
			return;
		}

		setProcessing(true);

		// Simulate payment processing
		await new Promise((resolve) => setTimeout(resolve, 2500));

		try {
			const slots = getSelectedSlotDetails();
			const sortedSlots = slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

			const bookingData: CreateBookingData = {
				venueId: venue._id!,
				courtId: selectedCourt._id!,
				bookingDate: selectedDate.toISOString(),
				startTime: sortedSlots[0].startTime,
				endTime: sortedSlots[sortedSlots.length - 1].endTime,
				numberOfSlots: slots.length,
			};

			const response = await bookingService.createBooking(bookingData);

			// Show confetti animation
			setShowConfetti(true);

			toast.success(
				<div>
					<p className="font-semibold">Booking Confirmed!</p>
					<p className="text-sm">Booking ID: {response._id}</p>
				</div>,
			);

			// Hide confetti and close modal after delay
			setTimeout(() => {
				setShowConfetti(false);
				onClose();
				navigate("/user/bookings");
			}, 3500);
		} catch (error: any) {
			console.error("Booking error:", error);
			toast.error(error.response?.data?.message || "Failed to book court");
		} finally {
			setProcessing(false);
		}
	};

	// Navigation handlers
	const handleNext = async () => {
		if (currentStep === "sport-date") {
			if (!selectedSport) {
				toast.error("Please select a sport");
				return;
			}
			await fetchCourtsAndAvailability();
			setCurrentStep("court-slots");
		} else if (currentStep === "court-slots") {
			if (selectedSlots.length === 0) {
				toast.error("Please select at least one time slot");
				return;
			}
			if (selectedSlots.length > 4) {
				toast.error("You can select a maximum of 4 slots");
				return;
			}
			setCurrentStep("payment");
		}
	};

	const handleBack = () => {
		if (currentStep === "court-slots") {
			setCurrentStep("sport-date");
		} else if (currentStep === "payment") {
			setCurrentStep("court-slots");
		}
	};

	const getStepNumber = () => {
		switch (currentStep) {
			case "sport-date":
				return 1;
			case "court-slots":
				return 2;
			case "payment":
				return 3;
			default:
				return 1;
		}
	};

	return (
		<>
			{/* Confetti Animation - Outside of Dialog to prevent layout issues */}
			{showConfetti && (
				<Confetti
					width={window.innerWidth}
					height={window.innerHeight}
					recycle={false}
					numberOfPieces={200}
					gravity={0.2}
					colors={["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#DDA0DD"]}
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						pointerEvents: "none",
						zIndex: 9999,
					}}
				/>
			)}

			<Dialog open={open} onOpenChange={() => !processing && onClose()}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle>Book a Court at {venue.name}</DialogTitle>
						<DialogDescription>Step {getStepNumber()} of 3</DialogDescription>
					</DialogHeader>

					{/* Progress Indicator */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-2 flex-1">
							<div className={`h-2 flex-1 rounded-full ${getStepNumber() >= 1 ? "bg-primary" : "bg-muted"}`} />
							<div className={`h-2 flex-1 rounded-full ${getStepNumber() >= 2 ? "bg-primary" : "bg-muted"}`} />
							<div className={`h-2 flex-1 rounded-full ${getStepNumber() >= 3 ? "bg-primary" : "bg-muted"}`} />
						</div>
					</div>

					<div className="flex-1 overflow-y-auto">
						{/* Step 1: Sport and Date Selection */}
						{currentStep === "sport-date" && (
							<div className="space-y-6">
								<div>
									<Label className="text-base font-semibold mb-3 block">Select Sport</Label>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
										{venue.sports.map((sport) => (
											<Button
												key={sport}
												variant={selectedSport === sport ? "default" : "outline"}
												className="h-auto py-3 px-4"
												onClick={() => setSelectedSport(sport as SportType)}
											>
												<Activity className="mr-2 h-4 w-4" />
												{formatSportLabel(sport)}
											</Button>
										))}
									</div>
								</div>

								<div>
									<Label className="text-base font-semibold mb-3 block">Select Date</Label>
									<div className="grid grid-cols-3 md:grid-cols-4 gap-2">
										{bookingDates.map((date) => (
											<Button
												key={date.toISOString()}
												variant={selectedDate.toDateString() === date.toDateString() ? "default" : "outline"}
												onClick={() => setSelectedDate(date)}
												className="h-auto py-2 px-3"
											>
												<div className="text-center">
													<p className="font-medium text-sm">{getDateLabel(date)}</p>
													<p className="text-xs opacity-75">{format(date, "MMM d")}</p>
												</div>
											</Button>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Step 2: Court and Slot Selection */}
						{currentStep === "court-slots" && (
							<div className="space-y-6">
								{loadingCourts ? (
									<div className="flex items-center justify-center py-12">
										<Loader2 className="h-8 w-8 animate-spin" />
									</div>
								) : courts.length === 0 ? (
									<div className="text-center py-12">
										<p className="text-muted-foreground">
											No courts available for {formatSportLabel(selectedSport!)} on {format(selectedDate, "EEE, MMM d")}
										</p>
										<Button onClick={() => setCurrentStep("sport-date")} className="mt-4">
											Choose Different Options
										</Button>
									</div>
								) : (
									<>
										<div>
											<Label className="text-base font-semibold mb-3 block">Select Court</Label>
											<Select value={selectedCourt?._id} onValueChange={handleCourtChange}>
												<SelectTrigger>
													<SelectValue placeholder="Choose a court" />
												</SelectTrigger>
												<SelectContent>
													{courts.map((court) => (
														<SelectItem key={court._id} value={court._id!}>
															<div className="flex items-center justify-between w-full">
																<span>{court.name}</span>
																<Badge variant="secondary" className="ml-2">
																	₹{court.defaultPrice}/hr
																</Badge>
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											{selectedCourt && (
												<div className="mt-3 p-4 rounded-lg border bg-background">
													{selectedCourt.description && (
														<p className="text-sm text-muted-foreground mb-2">{selectedCourt.description}</p>
													)}
													<div className="flex items-center gap-4 text-sm">
														<span className="flex items-center gap-1">
															<Clock className="h-3 w-3" />
															{selectedCourt.slotConfigurations.find((c) => c.isOpen)?.slotDuration || 1} hr slots
														</span>
														<span className="flex items-center gap-1">
															<IndianRupee className="h-3 w-3" />
															{selectedCourt.defaultPrice}/slot
														</span>
													</div>
												</div>
											)}
										</div>

										{selectedCourt && (
											<div>
												<div className="flex items-center justify-between mb-3">
													<Label className="text-base font-semibold block">Select Time Slots</Label>
													<div className="flex items-center gap-2">
														<Badge variant={selectedSlots.length >= 4 ? "destructive" : "secondary"}>
															{selectedSlots.length}/4 slots selected
														</Badge>
														<span className="text-xs text-muted-foreground">Max 4 slots allowed</span>
													</div>
												</div>
												{availability.length > 0 ? (
													<div className="space-y-2">
														{availability.map((slot) => {
															const slotKey = `${slot.startTime}-${slot.endTime}`;
															const isSelected = selectedSlots.includes(slotKey);

															return (
																<div
																	key={slotKey}
																	className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
																		isSelected
																			? "border-primary bg-primary/5"
																			: slot.isAvailable
																			? "border-border hover:border-primary/50"
																			: "border-border opacity-50 cursor-not-allowed"
																	}`}
																	onClick={() => slot.isAvailable && handleSlotToggle(slotKey)}
																>
																	<div className="flex items-center gap-3">
																		<Clock className="h-4 w-4 text-muted-foreground" />
																		<span className="font-medium">
																			{slot.startTime} - {slot.endTime}
																		</span>
																	</div>
																	<div className="flex items-center gap-3">
																		<Badge variant={slot.isAvailable ? "secondary" : "outline"}>₹{slot.price}</Badge>
																		{!slot.isAvailable && <span className="text-xs text-muted-foreground">Booked</span>}
																		{isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
																	</div>
																</div>
															);
														})}
													</div>
												) : (
													<p className="text-center py-8 text-muted-foreground">No slots available for this court</p>
												)}
											</div>
										)}
									</>
								)}
							</div>
						)}

						{/* Step 3: Payment Summary */}
						{currentStep === "payment" && (
							<div className="space-y-6">
								<div className="rounded-lg p-6 bg-white dark:bg-zinc-900">
									<h3 className="font-semibold mb-4">Booking Summary</h3>

									<div className="space-y-3">
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Venue</span>
											<span className="font-medium">{venue.name}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Sport</span>
											<span className="font-medium">{formatSportLabel(selectedSport!)}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Court</span>
											<span className="font-medium">{selectedCourt?.name}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Date</span>
											<span className="font-medium">{format(selectedDate, "EEE, MMM d, yyyy")}</span>
										</div>

										<hr className="my-2 border-border dark:border-zinc-700" />

										<div>
											<p className="text-sm text-muted-foreground mb-2">Selected Slots</p>
											{getSelectedSlotDetails().map((slot, index) => (
												<div key={index} className="flex justify-between text-sm py-1">
													<span>
														{slot.startTime} - {slot.endTime}
													</span>
													<span>₹{slot.price}</span>
												</div>
											))}
										</div>

										<hr className="my-2 border-border dark:border-zinc-700" />

										<div className="flex justify-between items-center pt-2">
											<span className="font-semibold">Total Amount</span>
											<span className="text-xl font-bold flex items-center">
												<IndianRupee className="h-5 w-5" />
												{calculateTotalAmount()}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Footer Actions */}
					<div className="flex justify-between items-center pt-4 border-t">
						<Button
							variant="outline"
							onClick={currentStep === "sport-date" ? onClose : handleBack}
							disabled={processing}
						>
							{currentStep === "sport-date" ? (
								"Cancel"
							) : (
								<>
									<ChevronLeft className="mr-2 h-4 w-4" />
									Back
								</>
							)}
						</Button>

						{currentStep === "payment" ? (
							<Button
								onClick={handleConfirmBooking}
								disabled={processing}
								className="gradient-primary text-primary-foreground cursor-pointer"
							>
								{processing ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing Payment...
									</>
								) : (
									<>
										Pay & Book
										<IndianRupee className="ml-2 h-4 w-4" />
									</>
								)}
							</Button>
						) : (
							<Button
								onClick={handleNext}
								disabled={
									(currentStep === "sport-date" && !selectedSport) ||
									(currentStep === "court-slots" && selectedSlots.length === 0)
								}
							>
								Next
								<ChevronRight className="ml-2 h-4 w-4" />
							</Button>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default BookingModal;
