import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface DailyEarning {
	date: string;
	earnings: number;
}

interface EarningsChartProps {
	data: DailyEarning[];
}

const EarningsChart = ({ data }: EarningsChartProps) => {
	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

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
				label: "Daily Earnings (10% Commission)",
				data: data.map((item) => item.earnings),
				fill: true,
				backgroundColor: "rgba(34, 197, 94, 0.1)", // Green with transparency
				borderColor: "rgb(34, 197, 94)", // Solid green
				borderWidth: 3,
				pointBackgroundColor: "rgb(34, 197, 94)",
				pointBorderColor: "rgb(34, 197, 94)",
				pointBorderWidth: 2,
				pointRadius: 4,
				pointHoverRadius: 6,
				tension: 0.4, // Creates the curved line effect
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
				text: "Admin Earnings Trend (Last 30 Days)",
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
				borderColor: "rgba(34, 197, 94, 0.5)",
				borderWidth: 1,
				displayColors: false,
				callbacks: {
					label: (context: any) => {
						return `Earnings: ${formatCurrency(context.parsed.y)}`;
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
					callback: (value: any) => {
						return formatCurrency(value);
					},
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

	return (
		<div className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
			<div className="h-80">
				<Line data={chartData} options={options} />
			</div>
		</div>
	);
};

export default EarningsChart;
