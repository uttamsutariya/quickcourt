import { useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	Filler,
} from "chart.js";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface BookingTrendData {
	daily: Array<{ date: string; bookings: number }>;
	weekly: Array<{ week: string; date: string; bookings: number }>;
	monthly: Array<{ month: string; date: string; bookings: number }>;
}

interface BookingTrendsChartProps {
	data: BookingTrendData;
}

type PeriodType = "daily" | "weekly" | "monthly";

const BookingTrendsChart = ({ data }: BookingTrendsChartProps) => {
	const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("daily");
	const [chartType, setChartType] = useState<"line" | "bar">("line");

	// Format date for display based on period
	const formatLabel = (item: any, period: PeriodType) => {
		if (period === "daily") {
			const date = new Date(item.date);
			return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
		}
		if (period === "weekly") {
			return item.week;
		}
		return item.month;
	};

	// Get current data based on selected period
	const getCurrentData = () => {
		return data[selectedPeriod] || [];
	};

	// Prepare chart data
	const chartData = {
		labels: getCurrentData().map((item) => formatLabel(item, selectedPeriod)),
		datasets: [
			{
				label: `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Bookings`,
				data: getCurrentData().map((item) => item.bookings),
				fill: chartType === "line",
				backgroundColor: chartType === "line" ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.8)",
				borderColor: "rgb(59, 130, 246)",
				borderWidth: chartType === "line" ? 3 : 1,
				pointBackgroundColor: "rgb(59, 130, 246)",
				pointBorderColor: "rgb(59, 130, 246)",
				pointBorderWidth: 2,
				pointRadius: chartType === "line" ? 4 : 0,
				pointHoverRadius: chartType === "line" ? 6 : 0,
				tension: 0.4,
				borderRadius: chartType === "bar" ? 4 : 0,
			},
		],
	};

	// Chart options
	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
				labels: {
					usePointStyle: true,
					padding: 20,
					font: {
						size: 12,
						weight: "bold" as const,
					},
				},
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
						return `Bookings: ${context.parsed.y}`;
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
						size: 11,
					},
					maxTicksLimit: selectedPeriod === "daily" ? 10 : undefined,
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
		elements: {
			point: {
				hoverBorderWidth: 3,
			},
		},
		interaction: {
			intersect: false,
			mode: "index" as const,
		},
	};

	const ChartComponent = chartType === "line" ? Line : Bar;

	return (
		<div className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-muted/50 rounded-lg">
						<TrendingUp className="h-5 w-5 text-foreground" />
					</div>
					<div>
						<h3 className="text-lg font-semibold">Booking Trends</h3>
						<p className="text-sm text-muted-foreground">Track your booking performance over time</p>
					</div>
				</div>

				{/* Chart Type Toggle */}
				<div className="flex items-center gap-2">
					<Button
						variant={chartType === "line" ? "default" : "outline"}
						size="sm"
						onClick={() => setChartType("line")}
					>
						<TrendingUp className="h-4 w-4" />
					</Button>
					<Button
						variant={chartType === "bar" ? "default" : "outline"}
						size="sm"
						onClick={() => setChartType("bar")}
					>
						<BarChart3 className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Period Selection */}
			<div className="flex gap-2 mb-6">
				<Button
					variant={selectedPeriod === "daily" ? "default" : "outline"}
					size="sm"
					onClick={() => setSelectedPeriod("daily")}
				>
					<Calendar className="h-4 w-4 mr-1" />
					Daily
				</Button>
				<Button
					variant={selectedPeriod === "weekly" ? "default" : "outline"}
					size="sm"
					onClick={() => setSelectedPeriod("weekly")}
				>
					<Calendar className="h-4 w-4 mr-1" />
					Weekly
				</Button>
				<Button
					variant={selectedPeriod === "monthly" ? "default" : "outline"}
					size="sm"
					onClick={() => setSelectedPeriod("monthly")}
				>
					<Calendar className="h-4 w-4 mr-1" />
					Monthly
				</Button>
			</div>

			{/* Chart */}
			<div className="h-80">
				{getCurrentData().length > 0 ? (
					<ChartComponent data={chartData} options={options} />
				) : (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						<div className="text-center">
							<Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
							<p className="text-lg font-medium mb-2">No booking data available</p>
							<p className="text-sm">Start accepting bookings to see trends here.</p>
						</div>
					</div>
				)}
			</div>

			{/* Summary Stats */}
			{getCurrentData().length > 0 && (
				<div className="mt-6 pt-4 border-t">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-center">
							<p className="text-sm text-muted-foreground">Total</p>
							<p className="text-lg font-semibold">
								{getCurrentData().reduce((sum, item) => sum + item.bookings, 0)}
							</p>
						</div>
						<div className="text-center">
							<p className="text-sm text-muted-foreground">Average</p>
							<p className="text-lg font-semibold">
								{Math.round(
									getCurrentData().reduce((sum, item) => sum + item.bookings, 0) / getCurrentData().length
								)}
							</p>
						</div>
						<div className="text-center">
							<p className="text-sm text-muted-foreground">Peak</p>
							<p className="text-lg font-semibold">
								{Math.max(...getCurrentData().map((item) => item.bookings))}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BookingTrendsChart;
