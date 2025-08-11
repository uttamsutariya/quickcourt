import { useState, useEffect } from "react";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { type Court } from "@/services/court.service";
import { SportType } from "@/types/enums";
import { formatSportLabel } from "@/utils/sport-formatter";

const courtFormSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(20, "Name must be at most 20 characters"),
	sportType: z.enum([
		SportType.CRICKET,
		SportType.BADMINTON,
		SportType.TENNIS,
		SportType.TABLE_TENNIS,
		SportType.FOOTBALL,
		SportType.BASKETBALL,
		SportType.VOLLEYBALL,
		SportType.SWIMMING,
		SportType.SQUASH,
		SportType.HOCKEY,
		SportType.BASEBALL,
		SportType.GOLF,
		SportType.BOXING,
		SportType.GYM_FITNESS,
		SportType.YOGA,
		SportType.OTHER,
	] as const),
	description: z.string().optional(),
	defaultPrice: z.number().min(0, "Price must be positive"),
});

type CourtFormValues = z.infer<typeof courtFormSchema>;

interface CourtFormProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: Partial<Court>) => Promise<void>;
	court?: Court | null;
	availableSports: SportType[];
}

const CourtForm = ({ open, onClose, onSubmit, court, availableSports }: CourtFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<CourtFormValues>({
		resolver: zodResolver(courtFormSchema),
		defaultValues: {
			name: "",
			sportType: SportType.BADMINTON,
			description: "",
			defaultPrice: 500,
		},
	});

	useEffect(() => {
		if (court) {
			form.reset({
				name: court.name,
				sportType: court.sportType,
				description: court.description || "",
				defaultPrice: court.defaultPrice,
			});
		} else {
			form.reset({
				name: "",
				sportType: availableSports[0] || SportType.BADMINTON,
				description: "",
				defaultPrice: 500,
			});
		}
	}, [court, form, availableSports]);

	const handleSubmit = async (values: CourtFormValues) => {
		setIsSubmitting(true);
		try {
			await onSubmit(values);
			form.reset();
			onClose();
		} catch (error) {
			console.error("Error submitting court:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			form.reset();
			onClose();
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{court ? "Edit Court" : "Add New Court"}</DialogTitle>
					<DialogDescription>
						{court
							? "Update the court details below."
							: "Create a new court for your venue. Default schedule will be 10 AM to 9 PM with 1-hour slots."}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Court Name</FormLabel>
									<FormControl>
										<Input placeholder="e.g., Court 1" {...field} disabled={isSubmitting} />
									</FormControl>
									<FormDescription>A short name for the court (2-10 characters)</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="sportType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sport Type</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting || !!court}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a sport" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{availableSports.map((sport) => (
												<SelectItem key={sport} value={sport}>
													{formatSportLabel(sport)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{court && <FormDescription>Sport type cannot be changed after court creation</FormDescription>}
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="e.g., Indoor court with wooden flooring"
											className="resize-none"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="defaultPrice"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Default Price per Slot (₹)</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="500"
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormDescription>
										Base price per slot. You can set different prices for specific days later.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{court ? "Updating..." : "Creating..."}
									</>
								) : court ? (
									"Update Court"
								) : (
									"Create Court"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CourtForm;
