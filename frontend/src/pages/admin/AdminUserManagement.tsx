import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
	Search,
	Filter,
	Users,
	Eye,
	UserCheck,
	ChevronLeft,
	ChevronRight,
	AlertCircle,
	Building2,
	UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import adminUserService, { type User, type UserFilters } from "@/services/admin-user.service";
import UserBookingHistorySheet from "@/components/admin/UserBookingHistorySheet";

const AdminUserManagement = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalUsers, setTotalUsers] = useState(0);
	const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const ITEMS_PER_PAGE = 20;

	useEffect(() => {
		fetchUsers();
	}, [currentPage, roleFilter, statusFilter]);

	// Debounced search effect
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (currentPage === 1) {
				fetchUsers();
			} else {
				setCurrentPage(1);
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [searchTerm]);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const filters: UserFilters = {
				page: currentPage,
				limit: ITEMS_PER_PAGE,
			};

			if (roleFilter !== "all") {
				filters.role = roleFilter;
			}

			if (statusFilter !== "all") {
				filters.status = statusFilter;
			}

			if (searchTerm.trim()) {
				filters.search = searchTerm.trim();
			}

			const response = await adminUserService.getUsers(filters);
			setUsers(response.users);
			setTotalPages(response.pagination.pages);
			setTotalUsers(response.pagination.total);
		} catch (error: any) {
			console.error("Failed to fetch users:", error);
			toast.error(error.message || "Failed to fetch users");
		} finally {
			setLoading(false);
		}
	};

	const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
		try {
			const action = currentStatus ? "ban" : "unban";
			await adminUserService.toggleUserStatus(userId);

			// Update the user in the local state
			setUsers(users.map((user) => (user._id === userId ? { ...user, isActive: !currentStatus } : user)));

			toast.success(`User ${action}ned successfully`);
		} catch (error: any) {
			console.error("Failed to toggle user status:", error);
			toast.error(error.message || "Failed to update user status");
		}
	};

	const handleViewBookings = (e: React.MouseEvent, userId: string, userName: string) => {
		e.preventDefault();
		e.stopPropagation();
		setSelectedUser({ id: userId, name: userName });
		setIsSheetOpen(true);
	};

	const handleCloseSheet = () => {
		setIsSheetOpen(false);
		setSelectedUser(null);
	};

	const getRoleIcon = (role: string) => {
		switch (role) {
			case "facility_owner":
				return <Building2 className="h-4 w-4" />;
			case "admin":
				return <UserCheck className="h-4 w-4" />;
			default:
				return <Users className="h-4 w-4" />;
		}
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300";
			case "facility_owner":
				return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300";
			default:
				return "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300";
		}
	};

	const formatRoleName = (role: string) => {
		switch (role) {
			case "facility_owner":
				return "Facility Owner";
			case "admin":
				return "Admin";
			default:
				return "User";
		}
	};

	const LoadingSkeleton = () => (
		<div className="space-y-4">
			{[...Array(10)].map((_, i) => (
				<div key={i} className="flex items-center space-x-4 p-4">
					<Skeleton className="h-12 w-12 rounded-full" />
					<div className="space-y-2 flex-1">
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-3 w-32" />
					</div>
					<Skeleton className="h-8 w-24" />
					<Skeleton className="h-8 w-16" />
					<Skeleton className="h-8 w-8" />
				</div>
			))}
		</div>
	);

	if (loading && users.length === 0) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="mb-8">
					<Skeleton className="h-9 w-64" />
					<Skeleton className="h-5 w-48 mt-2" />
				</div>
				<LoadingSkeleton />
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold">User Management</h1>
				<p className="text-muted-foreground mt-2">Manage platform users and facility owners</p>
			</div>

			{/* Filters and Search */}
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search by name or email..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9"
					/>
				</div>

				<div className="flex gap-2">
					<Select value={roleFilter} onValueChange={setRoleFilter}>
						<SelectTrigger className="w-[140px]">
							<Filter className="h-4 w-4 mr-2" />
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Roles</SelectItem>
							<SelectItem value="user">Users</SelectItem>
							<SelectItem value="facility_owner">Facility Owners</SelectItem>
						</SelectContent>
					</Select>

					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[120px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="inactive">Banned</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Results Summary */}
			<div className="mb-4">
				<p className="text-sm text-muted-foreground">
					Showing {users.length} of {totalUsers} users
				</p>
			</div>

			{/* Users Table */}
			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Join Date</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center py-12">
									<div className="flex flex-col items-center gap-2">
										<AlertCircle className="h-8 w-8 text-muted-foreground" />
										<p className="text-muted-foreground">No users found</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow key={user._id}>
									<TableCell>
										<div className="space-y-1">
											<p className="font-medium">{user.name}</p>
											<p className="text-sm text-muted-foreground">{user.email}</p>
										</div>
									</TableCell>
									<TableCell>
										<Badge className={getRoleBadgeColor(user.role)} variant="outline">
											<div className="flex items-center gap-1">
												{getRoleIcon(user.role)}
												{formatRoleName(user.role)}
											</div>
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={
												user.isActive
													? "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300"
													: "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300"
											}
										>
											{user.isActive ? "Active" : "Banned"}
										</Badge>
									</TableCell>
									<TableCell>
										<span className="text-sm">{format(new Date(user.createdAt), "dd MMM yyyy")}</span>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={(e) => handleViewBookings(e, user._id, user.name)}
											>
												<Eye className="h-4 w-4 mr-1" />
												Bookings
											</Button>

											{user.role !== "admin" && (
												<Button
													type="button"
													variant={user.isActive ? "destructive" : "default"}
													size="sm"
													className="cursor-pointer"
													onClick={() => handleToggleUserStatus(user._id, user.isActive)}
												>
													{user.isActive ? (
														<>
															<UserX className="h-4 w-4 mr-1" />
															Ban
														</>
													) : (
														<>
															<UserCheck className="h-4 w-4 mr-1" />
															Unban
														</>
													)}
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between mt-6">
					<div className="text-sm text-muted-foreground">
						Page {currentPage} of {totalPages}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage(currentPage - 1)}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage(currentPage + 1)}
							disabled={currentPage === totalPages}
						>
							Next
							<ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>
			)}

			{/* Booking History Sheet */}
			<UserBookingHistorySheet
				userId={selectedUser?.id || null}
				userName={selectedUser?.name || ""}
				isOpen={isSheetOpen}
				onClose={handleCloseSheet}
			/>
		</div>
	);
};

export default AdminUserManagement;
