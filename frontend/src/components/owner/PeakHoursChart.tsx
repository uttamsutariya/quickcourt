import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Button } from "@/components/ui/button";
import { Clock, Sun, Moon, Sunrise } from "lucide-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PeakHoursData {
	hour: string;
	bookings: number;
}

interface PeakHoursChartProps {
	data: PeakHoursData[];
}

type TimeFilter = "all" | "morning" | "afternoon" | "evening";

const PeakHoursChart = ({ data }: PeakHoursChartProps) => {
	const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

	// Filter data based on time period
	const getFilteredData = () => {
		if (timeFilter === "all") return data;

		const hourNum = (hour: string) => parseInt(hour.split(":")[0]);

		switch (timeFilter) {
			case "morning":
				return data.filter((item) => {
					const hour = hourNum(item.hour);
					return hour >= 6 && hour < 12;
				});
			case "afternoon":
				return data.filter((item) => {
					const hour = hourNum(item.hour);
					return hour >= 12 && hour < 18;
				});
			case "evening":
				return data.filter((item) => {
					const hour = hourNum(item.hour);
					return hour >= 18 || hour < 6;
				});
			default:
				return data;
		}
	};

	// Get color based on booking intensity
	const getBarColor = (bookings: number, maxBookings: number) => {
		const intensity = maxBookings > 0 ? bookings / maxBookings : 0;

		if (intensity > 0.8) return "rgba(239, 68, 68, 0.8)"; // High intensity - red
		if (intensity > 0.6) return "rgba(245, 158, 11, 0.8)"; // Medium-high intensity - orange
		if (intensity > 0.4) return "rgba(59, 130, 246, 0.8)"; // Medium intensity - blue
		if (intensity > 0.2) return "rgba(34, 197, 94, 0.8)"; // Low-medium intensity - green
		return "rgba(156, 163, 175, 0.8)"; // Low intensity - gray
	};

	const filteredData = getFilteredData();
	const maxBookings = Math.max(...filteredData.map((item) => item.bookings));

	// Prepare chart data
	const chartData = {
		labels: filteredData.map((item) => item.hour),
		datasets: [
			{
				label: "Bookings",
				data: filteredData.map((item) => item.bookings),
				backgroundColor: filteredData.map((item) => getBarColor(item.bookings, maxBookings)),
				borderColor: filteredData.map((item) => getBarColor(item.bookings, maxBookings).replace("0.8", "1")),
				borderWidth: 1,
				borderRadius: 4,
			},
		],
	};

	// Chart options
	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: false,
			},
			tooltip: {
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				titleColor: "white",
				bodyColor: "white",
				borderColor: "rgba(59, 130, 246, 0.5)",
				borderWidth: 1,
				displayColors: false,
				callbacks: {
					label: (context: any) => {
						const hour = context.label;
						const bookings = context.parsed.y;
						return `${hour}: ${bookings} booking${bookings !== 1 ? "s" : ""}`;
					},
					afterLabel: (context: any) => {
						const bookings = context.parsed.y;
						const percentage = maxBookings > 0 ? ((bookings / maxBookings) * 100).toFixed(1) : "0";
						return `${percentage}% of peak activity`;
					},
				},
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					font: {
						size: 10,
					},
					maxRotation: 45,
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					color: "rgba(0, 0, 0, 0.1)",
					drawBorder: false,
				},
				ticks: {
					font: {
						size: 11,
					},
					stepSize: 1,
				},
			},
		},
		interaction: {
			intersect: false,
			mode: "index" as const,
		},
	};

	// Find peak hours
	const getPeakHours = () => {
		if (filteredData.length === 0) return [];

		const sortedData = [...filteredData].sort((a, b) => b.bookings - a.bookings);
		return sortedData.slice(0, 3).filter((item) => item.bookings > 0);
	};

	const peakHours = getPeakHours();

	// Get time period label
	const getTimePeriodLabel = (filter: TimeFilter) => {
		switch (filter) {
			case "morning":
				return "Morning (6AM - 12PM)";
			case "afternoon":
				return "Afternoon (12PM - 6PM)";
			case "evening":
				return "Evening (6PM - 6AM)";
			default:
				return "All Hours";
		}
	};

	return (
		<div className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-muted/50 rounded-lg">
						<Clock className="h-5 w-5 text-foreground" />
					</div>
					<div>
						<h3 className="text-lg font-semibold">Peak Booking Hours</h3>
						<p className="text-sm text-muted-foreground">Discover when your courts are most popular</p>
					</div>
				</div>
			</div>

			{/* Time Filter Selection */}
			<div className="flex gap-2 mb-6 flex-wrap">
				<Button variant={timeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setTimeFilter("all")}>
					<Clock className="h-4 w-4 mr-1" />
					All Hours
				</Button>
				<Button
					variant={timeFilter === "morning" ? "default" : "outline"}
					size="sm"
					onClick={() => setTimeFilter("morning")}
				>
					<Sunrise className="h-4 w-4 mr-1" />
					Morning
				</Button>
				<Button
					variant={timeFilter === "afternoon" ? "default" : "outline"}
					size="sm"
					onClick={() => setTimeFilter("afternoon")}
				>
					<Sun className="h-4 w-4 mr-1" />
					Afternoon
				</Button>
				<Button
					variant={timeFilter === "evening" ? "default" : "outline"}
					size="sm"
					onClick={() => setTimeFilter("evening")}
				>
					<Moon className="h-4 w-4 mr-1" />
					Evening
				</Button>
			</div>

			{/* Current Filter Display */}
			<div className="mb-4">
				<p className="text-sm text-muted-foreground">
					Showing: <span className="font-medium">{getTimePeriodLabel(timeFilter)}</span>
				</p>
			</div>

			{/* Chart */}
			<div className="h-80">
				{filteredData.length > 0 && maxBookings > 0 ? (
					<Bar data={chartData} options={options} />
				) : (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						<div className="text-center">
							<Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
							<p className="text-lg font-medium mb-2">No booking data available</p>
							<p className="text-sm">Start accepting bookings to see peak hour patterns here.</p>
						</div>
					</div>
				)}
			</div>

			{/* Peak Hours Summary */}
			{peakHours.length > 0 && (
				<div className="mt-6 pt-4 border-t">
					<h4 className="text-sm font-medium mb-3">Top Peak Hours</h4>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						{peakHours.map((hour, index) => (
							<div key={hour.hour} className="bg-muted/20 rounded-lg p-3 text-center">
								<div className="flex items-center justify-center gap-2 mb-1">
									<span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">#{index + 1}</span>
									<span className="font-medium">{hour.hour}</span>
								</div>
								<p className="text-sm text-muted-foreground">
									{hour.bookings} booking{hour.bookings !== 1 ? "s" : ""}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Color Legend */}
			{filteredData.length > 0 && maxBookings > 0 && (
				<div className="mt-4 pt-4 border-t">
					<p className="text-xs text-muted-foreground mb-2">Activity Intensity:</p>
					<div className="flex items-center gap-4 text-xs">
						<div className="flex items-center gap-1">
							<div className="w-3 h-3 rounded bg-gray-400"></div>
							<span>Low</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="w-3 h-3 rounded bg-green-500"></div>
							<span>Medium</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="w-3 h-3 rounded bg-blue-500"></div>
							<span>High</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="w-3 h-3 rounded bg-orange-500"></div>
							<span>Very High</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="w-3 h-3 rounded bg-red-500"></div>
							<span>Peak</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PeakHoursChart;
