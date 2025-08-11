import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import useAuthStore from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import uploadService from "@/services/upload.service";

interface ProfileFormData {
	name: string;
	phoneNumber: string;
	avatarUrl?: string;
}

const Profile = () => {
	const { user, setUser } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [avatarPreview, setAvatarPreview] = useState<string>("");

	const form = useForm<ProfileFormData>({
		defaultValues: {
			name: user?.name || "",
			phoneNumber: user?.phoneNumber || "",
			avatarUrl: user?.avatarUrl || "",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name || "",
				phoneNumber: user.phoneNumber || "",
				avatarUrl: user.avatarUrl || "",
			});
			setAvatarPreview(user.avatarUrl || "");
		}
	}, [user, form]);

	const onSubmit = async (data: ProfileFormData) => {
		try {
			setIsLoading(true);

			// Prepare the update data
			const updateData: any = {
				name: data.name,
			};

			// Only include phoneNumber if it's provided
			if (data.phoneNumber) {
				updateData.phoneNumber = data.phoneNumber;
			}

			// Only include avatarUrl if it's provided
			if (avatarPreview) {
				updateData.avatarUrl = avatarPreview;
			}

			const response = await apiClient.put("/auth/profile", updateData);

			if (response.data.success) {
				// Update the user in the auth store
				setUser(response.data.user);
				toast.success("Profile updated successfully");
			}
		} catch (error: any) {
			console.error("Error updating profile:", error);
			toast.error(error.response?.data?.message || "Failed to update profile");
		} finally {
			setIsLoading(false);
		}
	};

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Avatar image must be less than 5MB");
				return;
			}

			// Create local preview immediately
			const reader = new FileReader();
			reader.onloadend = () => {
				setAvatarPreview(reader.result as string);
			};
			reader.readAsDataURL(file);

			try {
				setIsUploadingAvatar(true);
				// Upload to Cloudinary
				const response = await uploadService.uploadImage(file);

				if (response.success) {
					setAvatarPreview(response.url);
					toast.success("Avatar uploaded successfully");
				}
			} catch (error) {
				console.error("Error uploading avatar:", error);
				toast.error("Failed to upload avatar. Please try again.");
			} finally {
				setIsUploadingAvatar(false);
			}
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getRoleDisplay = (role: string) => {
		const roleMap: Record<string, string> = {
			user: "User",
			facility_owner: "Facility Owner",
			admin: "Administrator",
		};
		return roleMap[role] || role;
	};

	if (!user) return null;

	return (
		<div className="container max-w-4xl py-8 px-4">
			<div className="space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold">Profile</h1>
					<p className="text-muted-foreground mt-2">Manage your personal information and account settings</p>
				</div>

				<Separator />

				{/* Profile Card */}
				<Card>
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
						<CardDescription>Update your profile details and contact information</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								{/* Avatar Section */}
								<div className="flex items-center gap-6">
									<div className="relative">
										<div className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
											{avatarPreview ? (
												<img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
											) : (
												<div className="h-full w-full flex items-center justify-center gradient-primary text-primary-foreground text-2xl font-semibold">
													{getInitials(user.name || user.email)}
												</div>
											)}
										</div>
										<label
											htmlFor="avatar-upload"
											className={`absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-colors ${
												isUploadingAvatar ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-primary/90"
											}`}
										>
											{isUploadingAvatar ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Camera className="h-4 w-4" />
											)}
											<input
												id="avatar-upload"
												type="file"
												accept="image/*"
												onChange={handleAvatarChange}
												disabled={isUploadingAvatar}
												className="hidden"
											/>
										</label>
									</div>
									<div>
										<h3 className="font-semibold text-lg">{user.name}</h3>
										<p className="text-sm text-muted-foreground">{getRoleDisplay(user.role)}</p>
									</div>
								</div>

								<Separator />

								{/* Form Fields */}
								<div className="grid gap-6">
									{/* Name Field */}
									<FormField
										control={form.control}
										name="name"
										rules={{
											required: "Name is required",
											minLength: {
												value: 2,
												message: "Name must be at least 2 characters",
											},
											maxLength: {
												value: 100,
												message: "Name cannot exceed 100 characters",
											},
										}}
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													<User className="h-4 w-4 inline mr-2" />
													Full Name
												</FormLabel>
												<FormControl>
													<Input placeholder="Enter your full name" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Email Field (Read-only) */}
									<div className="space-y-2">
										<Label>
											<Mail className="h-4 w-4 inline mr-2" />
											Email Address
										</Label>
										<Input value={user.email} disabled className="bg-muted" />
										<p className="text-xs text-muted-foreground">Email cannot be changed</p>
									</div>

									{/* Phone Number Field */}
									<FormField
										control={form.control}
										name="phoneNumber"
										rules={{
											pattern: {
												value: /^[0-9]{10,15}$/,
												message: "Please enter a valid phone number (10-15 digits)",
											},
										}}
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													<Phone className="h-4 w-4 inline mr-2" />
													Phone Number
												</FormLabel>
												<FormControl>
													<Input placeholder="Enter your phone number" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Submit Button */}
								<div className="flex justify-end">
									<Button type="submit" disabled={isLoading} className="min-w-[120px]">
										{isLoading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Updating...
											</>
										) : (
											"Save Changes"
										)}
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>

				{/* Account Information Card */}
				<Card>
					<CardHeader>
						<CardTitle>Account Information</CardTitle>
						<CardDescription>View your account details and status</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<div>
									<p className="text-sm font-medium">Account Type</p>
									<p className="text-sm text-muted-foreground">{getRoleDisplay(user.role)}</p>
								</div>
							</div>
							<Separator />
							<div className="flex justify-between items-center">
								<div>
									<p className="text-sm font-medium">Account Status</p>
									<p className="text-sm text-muted-foreground">Active</p>
								</div>
							</div>
							<Separator />
							<div className="flex justify-between items-center">
								<div>
									<p className="text-sm font-medium">Member Since</p>
									<p className="text-sm text-muted-foreground">
										{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Profile;
