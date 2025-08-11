import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy } from "lucide-react";
import type { Court, SlotConfiguration } from "@/services/court.service";
import { DayOfWeek, SlotDuration } from "@/types/enums";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const slotConfigSchema = z.object({
	configurations: z
		.array(
			z.object({
				dayOfWeek: z.enum([
					DayOfWeek.MONDAY,
					DayOfWeek.TUESDAY,
					DayOfWeek.WEDNESDAY,
					DayOfWeek.THURSDAY,
					DayOfWeek.FRIDAY,
					DayOfWeek.SATURDAY,
					DayOfWeek.SUNDAY,
				] as const),
				isOpen: z.boolean(),
				startTime: z.string(),
				slotDuration: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
				numberOfSlots: z.number().min(1),
				price: z.number().min(0),
			}),
		)
		.length(7),
});

type SlotConfigFormValues = z.infer<typeof slotConfigSchema>;

interface SlotConfigurationFormProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (configurations: SlotConfiguration[]) => Promise<void>;
	court: Court;
}

const DAYS_ORDER = [
	DayOfWeek.MONDAY,
	DayOfWeek.TUESDAY,
	DayOfWeek.WEDNESDAY,
	DayOfWeek.THURSDAY,
	DayOfWeek.FRIDAY,
	DayOfWeek.SATURDAY,
	DayOfWeek.SUNDAY,
];

const DAY_LABELS: Record<DayOfWeek, string> = {
	[DayOfWeek.MONDAY]: "Monday",
	[DayOfWeek.TUESDAY]: "Tuesday",
	[DayOfWeek.WEDNESDAY]: "Wednesday",
	[DayOfWeek.THURSDAY]: "Thursday",
	[DayOfWeek.FRIDAY]: "Friday",
	[DayOfWeek.SATURDAY]: "Saturday",
	[DayOfWeek.SUNDAY]: "Sunday",
};

const SlotConfigurationForm = ({ open, onClose, onSubmit, court }: SlotConfigurationFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<DayOfWeek>(DayOfWeek.MONDAY);

	const form = useForm<SlotConfigFormValues>({
		resolver: zodResolver(slotConfigSchema),
		defaultValues: {
			configurations: DAYS_ORDER.map((day) => {
				const existing = court.slotConfigurations.find((c) => c.dayOfWeek === day);
				return (
					existing || {
						dayOfWeek: day,
						isOpen: true,
						startTime: "10:00",
						slotDuration: SlotDuration.ONE_HOUR,
						numberOfSlots: 11,
						price: court.defaultPrice,
					}
				);
			}),
		},
	});

	const handleSubmit = async (values: SlotConfigFormValues) => {
		setIsSubmitting(true);
		try {
			// Validate time constraints for each configuration
			for (const config of values.configurations) {
				if (config.isOpen) {
					const [hours] = config.startTime.split(":").map(Number);
					const totalHours = config.slotDuration * config.numberOfSlots;
					const endHour = hours + totalHours;

					if (endHour > 24) {
						toast.error(`${DAY_LABELS[config.dayOfWeek]}: End time exceeds 24 hours`);
						setIsSubmitting(false);
						return;
					}
				}
			}

			await onSubmit(values.configurations as SlotConfiguration[]);
			onClose();
		} catch (error) {
			console.error("Error updating slot configuration:", error);
			toast.error("Failed to update slot configuration");
		} finally {
			setIsSubmitting(false);
		}
	};

	const copyToOtherDays = (sourceDay: DayOfWeek, targetDays: DayOfWeek[]) => {
		const sourceIndex = DAYS_ORDER.indexOf(sourceDay);
		const sourceConfig = form.getValues(`configurations.${sourceIndex}`);

		targetDays.forEach((targetDay) => {
			const targetIndex = DAYS_ORDER.indexOf(targetDay);
			form.setValue(`configurations.${targetIndex}`, {
				...sourceConfig,
				dayOfWeek: targetDay,
			});
		});

		toast.success(`Configuration copied to ${targetDays.length} day(s)`);
	};

	const getEndTime = (startTime: string, duration: number, slots: number): string => {
		const [hours, minutes] = startTime.split(":").map(Number);
		const totalMinutes = hours * 60 + minutes + duration * slots * 60;
		const endHours = Math.floor(totalMinutes / 60);
		const endMinutes = totalMinutes % 60;

		if (endHours >= 24) {
			return "Next day";
		}

		return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
	};

	return (
		<Dialog open={open} onOpenChange={() => !isSubmitting && onClose()}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Configure Weekly Schedule - {court.name}</DialogTitle>
					<DialogDescription>Set operating hours and slot configurations for each day of the week.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DayOfWeek)}>
							<TabsList className="grid grid-cols-7 w-full">
								{DAYS_ORDER.map((day) => (
									<TabsTrigger key={day} value={day} className="text-xs">
										{DAY_LABELS[day].slice(0, 3)}
									</TabsTrigger>
								))}
							</TabsList>

							{DAYS_ORDER.map((day, index) => (
								<TabsContent key={day} value={day} className="space-y-4 mt-4">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold">{DAY_LABELS[day]}</h3>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="outline" size="sm">
													<Copy className="mr-2 h-4 w-4" />
													Copy to...
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuLabel>Copy to other days</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() =>
														copyToOtherDays(
															day,
															DAYS_ORDER.filter((d) => d !== day),
														)
													}
												>
													All other days
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => {
														const weekdays = [
															DayOfWeek.MONDAY,
															DayOfWeek.TUESDAY,
															DayOfWeek.WEDNESDAY,
															DayOfWeek.THURSDAY,
															DayOfWeek.FRIDAY,
														].filter((d) => d !== day);
														copyToOtherDays(day, weekdays);
													}}
												>
													All weekdays
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => {
														const weekends = [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY].filter((d) => d !== day);
														copyToOtherDays(day, weekends);
													}}
												>
													Weekend days
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												{DAYS_ORDER.filter((d) => d !== day).map((targetDay) => (
													<DropdownMenuItem key={targetDay} onClick={() => copyToOtherDays(day, [targetDay])}>
														{DAY_LABELS[targetDay]}
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>

									<FormField
										control={form.control}
										name={`configurations.${index}.isOpen`}
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Court is open on {DAY_LABELS[day]}</FormLabel>
												</div>
											</FormItem>
										)}
									/>

									{form.watch(`configurations.${index}.isOpen`) && (
										<div className="space-y-4 pl-6">
											<div className="grid grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name={`configurations.${index}.startTime`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Start Time</FormLabel>
															<FormControl>
																<Input type="time" {...field} disabled={isSubmitting} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name={`configurations.${index}.slotDuration`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Slot Duration</FormLabel>
															<Select
																onValueChange={(value) => field.onChange(Number(value))}
																value={field.value?.toString()}
																disabled={isSubmitting}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="1">1 Hour</SelectItem>
																	<SelectItem value="2">2 Hours</SelectItem>
																	<SelectItem value="3">3 Hours</SelectItem>
																	<SelectItem value="4">4 Hours</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<div className="grid grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name={`configurations.${index}.numberOfSlots`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Number of Slots</FormLabel>
															<FormControl>
																<Input
																	type="number"
																	min="1"
																	{...field}
																	onChange={(e) => field.onChange(Number(e.target.value))}
																	disabled={isSubmitting}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name={`configurations.${index}.price`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Price per Slot (₹)</FormLabel>
															<FormControl>
																<Input
																	type="number"
																	min="0"
																	{...field}
																	onChange={(e) => field.onChange(Number(e.target.value))}
																	disabled={isSubmitting}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											{/* Display calculated end time */}
											<div className="p-3 bg-muted rounded-lg">
												<p className="text-sm">
													<span className="font-medium">Operating Hours: </span>
													{form.watch(`configurations.${index}.startTime`)} -{" "}
													{getEndTime(
														form.watch(`configurations.${index}.startTime`),
														form.watch(`configurations.${index}.slotDuration`) as number,
														form.watch(`configurations.${index}.numberOfSlots`),
													)}
												</p>
												<p className="text-sm mt-1">
													<span className="font-medium">Total Hours: </span>
													{(form.watch(`configurations.${index}.slotDuration`) as number) *
														form.watch(`configurations.${index}.numberOfSlots`)}{" "}
													hours
												</p>
											</div>
										</div>
									)}
								</TabsContent>
							))}
						</Tabs>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									"Save Schedule"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default SlotConfigurationForm;
