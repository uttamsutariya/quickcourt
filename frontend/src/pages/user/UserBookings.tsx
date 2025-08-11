import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Trophy, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserBookings = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("upcoming");

	// Mock data for demonstration
	const upcomingBookings: any[] = [];
	const pastBookings: any[] = [];

	const EmptyState = ({ type }: { type: string }) => (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<div className="p-4 rounded-full bg-muted mb-4">
				<Calendar className="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold mb-2">No {type} bookings</h3>
			<p className="text-muted-foreground mb-6 max-w-sm">
				{type === "upcoming"
					? "You don't have any upcoming bookings. Start by browsing available venues."
					: "You haven't made any bookings yet. Find your perfect venue and book a court!"}
			</p>
			<Button onClick={() => navigate("/venues")}>Browse Venues</Button>
		</div>
	);

	return (
		<div className="space-y-6 my-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold">My Bookings</h1>
				<p className="text-muted-foreground mt-2">Manage your court bookings and view history</p>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full max-w-md grid-cols-3">
					<TabsTrigger value="upcoming">Upcoming</TabsTrigger>
					<TabsTrigger value="past">Past</TabsTrigger>
					<TabsTrigger value="cancelled">Cancelled</TabsTrigger>
				</TabsList>

				{/* Upcoming Bookings */}
				<TabsContent value="upcoming" className="space-y-4">
					{upcomingBookings.length > 0 ? (
						upcomingBookings.map((booking) => (
							<Card key={booking.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg">{booking.venueName}</CardTitle>
											<CardDescription className="flex items-center gap-2 mt-1">
												<MapPin className="h-4 w-4" />
												{booking.address}
											</CardDescription>
										</div>
										<Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmed</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span>{booking.date}</span>
										</div>
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<span>{booking.time}</span>
										</div>
										<div className="flex items-center gap-2">
											<Trophy className="h-4 w-4 text-muted-foreground" />
											<span>{booking.sport}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-semibold">₹{booking.price}</span>
										</div>
									</div>
									<div className="flex gap-2 mt-4">
										<Button size="sm" variant="outline">
											View Details
										</Button>
										<Button size="sm" variant="destructive">
											Cancel Booking
										</Button>
									</div>
								</CardContent>
							</Card>
						))
					) : (
						<EmptyState type="upcoming" />
					)}
				</TabsContent>

				{/* Past Bookings */}
				<TabsContent value="past" className="space-y-4">
					{pastBookings.length > 0 ? (
						pastBookings.map((booking) => (
							<Card key={booking.id} className="opacity-75">
								{/* Similar structure to upcoming bookings */}
							</Card>
						))
					) : (
						<EmptyState type="past" />
					)}
				</TabsContent>

				{/* Cancelled Bookings */}
				<TabsContent value="cancelled" className="space-y-4">
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="p-4 rounded-full bg-muted mb-4">
							<AlertCircle className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold mb-2">No cancelled bookings</h3>
						<p className="text-muted-foreground">You haven't cancelled any bookings.</p>
					</div>
				</TabsContent>
			</Tabs>

			{/* Info Card */}
			<Card className="bg-muted/50">
				<CardContent className="p-6">
					<h3 className="font-semibold mb-2 flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-primary" />
						Booking Policy
					</h3>
					<ul className="text-sm text-muted-foreground space-y-1">
						<li>• Bookings can be cancelled up to 2 hours before the scheduled time</li>
						<li>• Full refund for cancellations made 24 hours in advance</li>
						<li>• 50% refund for cancellations made 2-24 hours in advance</li>
						<li>• No refund for last-minute cancellations (less than 2 hours)</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
};

export default UserBookings;
