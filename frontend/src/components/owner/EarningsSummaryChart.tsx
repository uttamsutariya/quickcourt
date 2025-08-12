import { useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Button } from "@/components/ui/button";
import { IndianRupee, PieChart, BarChart3 } from "lucide-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface EarningsData {
	daily: Array<{ date: string; grossEarnings: number; netEarnings: number }>;
	monthly: Array<{ month: string; date: string; grossEarnings: number; netEarnings: number }>;
}

interface EarningsSummaryChartProps {
	data: EarningsData;
}

type PeriodType = "daily" | "monthly";
type ChartType = "bar" | "doughnut";

const EarningsSummaryChart = ({ data }: EarningsSummaryChartProps) => {
	const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("daily");
	const [chartType, setChartType] = useState<ChartType>("bar");

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	// Format label for display
	const formatLabel = (item: any, period: PeriodType) => {
		if (period === "daily") {
			const date = new Date(item.date);
			return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
		}
		return item.month;
	};

	// Get current data based on selected period
	const getCurrentData = () => {
		return data[selectedPeriod] || [];
	};

	// Prepare bar chart data
	const barChartData = {
		labels: getCurrentData().map((item) => formatLabel(item, selectedPeriod)),
		datasets: [
			{
				label: "Gross Earnings",
				data: getCurrentData().map((item) => item.grossEarnings),
				backgroundColor: "rgba(239, 68, 68, 0.8)",
				borderColor: "rgb(239, 68, 68)",
				borderWidth: 1,
				borderRadius: 4,
			},
			{
				label: "Net Earnings (After Commission)",
				data: getCurrentData().map((item) => item.netEarnings),
				backgroundColor: "rgba(34, 197, 94, 0.8)",
				borderColor: "rgb(34, 197, 94)",
				borderWidth: 1,
				borderRadius: 4,
			},
		],
	};

	// Prepare doughnut chart data (showing total earnings breakdown)
	const totalGrossEarnings = getCurrentData().reduce((sum, item) => sum + item.grossEarnings, 0);
	const totalNetEarnings = getCurrentData().reduce((sum, item) => sum + item.netEarnings, 0);
	const totalCommission = totalGrossEarnings - totalNetEarnings;

	const doughnutChartData = {
		labels: ["Net Earnings", "Platform Commission (10%)"],
		datasets: [
			{
				data: [totalNetEarnings, totalCommission],
				backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
				borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)"],
				borderWidth: 2,
				hoverOffset: 4,
			},
		],
	};

	// Chart options for bar chart
	const barOptions = {
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
				borderColor: "rgba(34, 197, 94, 0.5)",
				borderWidth: 1,
				displayColors: true,
				callbacks: {
					label: (context: any) => {
						return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
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
					callback: (value: any) => {
						return formatCurrency(value);
					},
				},
			},
		},
		interaction: {
			intersect: false,
			mode: "index" as const,
		},
	};

	// Chart options for doughnut chart
	const doughnutOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "bottom" as const,
				labels: {
					usePointStyle: true,
					padding: 20,
					font: {
						size: 12,
						weight: "bold" as const,
					},
				},
			},
			tooltip: {
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				titleColor: "white",
				bodyColor: "white",
				borderColor: "rgba(34, 197, 94, 0.5)",
				borderWidth: 1,
				displayColors: true,
				callbacks: {
					label: (context: any) => {
						const percentage = ((context.parsed / totalGrossEarnings) * 100).toFixed(1);
						return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
					},
				},
			},
		},
	};

	return (
		<div className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-muted/50 rounded-lg">
						<IndianRupee className="h-5 w-5 text-foreground" />
					</div>
					<div>
						<h3 className="text-lg font-semibold">Earnings Summary</h3>
						<p className="text-sm text-muted-foreground">Track your revenue and commission breakdown</p>
					</div>
				</div>

				{/* Chart Type Toggle */}
				<div className="flex items-center gap-2">
					<Button variant={chartType === "bar" ? "default" : "outline"} size="sm" onClick={() => setChartType("bar")}>
						<BarChart3 className="h-4 w-4" />
					</Button>
					<Button
						variant={chartType === "doughnut" ? "default" : "outline"}
						size="sm"
						onClick={() => setChartType("doughnut")}
					>
						<PieChart className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Period Selection (only for bar chart) */}
			{chartType === "bar" && (
				<div className="flex gap-2 mb-6">
					<Button
						variant={selectedPeriod === "daily" ? "default" : "outline"}
						size="sm"
						onClick={() => setSelectedPeriod("daily")}
					>
						Daily (30 days)
					</Button>
					<Button
						variant={selectedPeriod === "monthly" ? "default" : "outline"}
						size="sm"
						onClick={() => setSelectedPeriod("monthly")}
					>
						Monthly (12 months)
					</Button>
				</div>
			)}

			{/* Chart */}
			<div className="h-80">
				{getCurrentData().length > 0 ? (
					chartType === "bar" ? (
						<Bar data={barChartData} options={barOptions} />
					) : (
						<Doughnut data={doughnutChartData} options={doughnutOptions} />
					)
				) : (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						<div className="text-center">
							<IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-20" />
							<p className="text-lg font-medium mb-2">No earnings data available</p>
							<p className="text-sm">Start earning from bookings to see your revenue breakdown here.</p>
						</div>
					</div>
				)}
			</div>

			{/* Summary Stats */}
			{getCurrentData().length > 0 && (
				<div className="mt-6 pt-4 border-t">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-center">
							<p className="text-sm text-muted-foreground">Total Gross</p>
							<p className="text-lg font-semibold text-red-600 dark:text-red-400">
								{formatCurrency(totalGrossEarnings)}
							</p>
						</div>
						<div className="text-center">
							<p className="text-sm text-muted-foreground">Your Earnings</p>
							<p className="text-lg font-semibold text-green-600 dark:text-green-400">
								{formatCurrency(totalNetEarnings)}
							</p>
						</div>
						<div className="text-center">
							<p className="text-sm text-muted-foreground">Commission Paid</p>
							<p className="text-lg font-semibold text-muted-foreground">{formatCurrency(totalCommission)}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EarningsSummaryChart;
