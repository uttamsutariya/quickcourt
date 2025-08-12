import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DailyBooking {
	date: string;
	bookings: number;
}

interface BookingActivityChartProps {
	data: DailyBooking[];
}

const BookingActivityChart = ({ data }: BookingActivityChartProps) => {
	// Format date for display
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-IN", {
			month: "short",
			day: "numeric",
		});
	};

	// Prepare chart data
	const chartData = {
		labels: data.map((item) => formatDate(item.date)),
		datasets: [
			{
				label: "Daily Bookings",
				data: data.map((item) => item.bookings),
				backgroundColor: "rgba(59, 130, 246, 0.8)", // Blue with transparency
				borderColor: "rgb(59, 130, 246)", // Solid blue
				borderWidth: 1,
				borderRadius: 4,
				borderSkipped: false,
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
				display: true,
				text: "Booking Activity (Last 30 Days)",
				font: {
					size: 16,
					weight: "bold" as const,
				},
				padding: {
					bottom: 20,
				},
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
						const value = context.parsed.y;
						return `Bookings: ${value} ${value === 1 ? "booking" : "bookings"}`;
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
					maxTicksLimit: 10, // Limit number of x-axis labels
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
					stepSize: 1, // Show only whole numbers
					callback: (value: any) => {
						if (Number.isInteger(value)) {
							return value;
						}
						return null;
					},
				},
			},
		},
		interaction: {
			intersect: false,
			mode: "index" as const,
		},
	};

	return (
		<div className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
			<div className="h-80">
				<Bar data={chartData} options={options} />
			</div>
		</div>
	);
};

export default BookingActivityChart;
