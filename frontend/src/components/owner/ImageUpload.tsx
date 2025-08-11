import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import uploadService from "@/services/upload.service";
import { toast } from "sonner";

interface ImageUploadProps {
	images: string[];
	onImagesChange: (images: string[]) => void;
	maxImages?: number;
}

const ImageUpload = ({ images, onImagesChange, maxImages = 10 }: ImageUploadProps) => {
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		// Check max images limit
		if (images.length + files.length > maxImages) {
			toast.error(`Maximum ${maxImages} images allowed`);
			return;
		}

		// Validate file types
		const validFiles = files.filter((file) => {
			if (!file.type.startsWith("image/")) {
				toast.error(`${file.name} is not an image`);
				return false;
			}
			if (file.size > 5 * 1024 * 1024) {
				toast.error(`${file.name} is too large (max 5MB)`);
				return false;
			}
			return true;
		});

		if (validFiles.length === 0) return;

		setUploading(true);
		try {
			// Upload all images
			const uploadPromises = validFiles.map((file) => uploadService.uploadImage(file));
			const results = await Promise.all(uploadPromises);

			// Extract URLs and add to existing images
			const newUrls = results.map((result) => result.url);
			onImagesChange([...images, ...newUrls]);

			toast.success(`${validFiles.length} image(s) uploaded successfully`);
		} catch (error: any) {
			console.error("Upload error:", error);
			toast.error(error.message || "Failed to upload images");
		} finally {
			setUploading(false);
			// Reset input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const removeImage = (index: number) => {
		const newImages = images.filter((_, i) => i !== index);
		onImagesChange(newImages);
	};

	return (
		<div className="space-y-4">
			{/* Upload Button */}
			<div className="flex items-center gap-4">
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept="image/*"
					onChange={handleFileSelect}
					className="hidden"
					disabled={uploading || images.length >= maxImages}
				/>
				<Button
					type="button"
					variant="outline"
					onClick={() => fileInputRef.current?.click()}
					disabled={uploading || images.length >= maxImages}
				>
					{uploading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Uploading...
						</>
					) : (
						<>
							<Upload className="mr-2 h-4 w-4" />
							Upload Images
						</>
					)}
				</Button>
				<span className="text-sm text-muted-foreground">
					{images.length}/{maxImages} images
				</span>
			</div>

			{/* Image Preview Grid */}
			{images.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
					{images.map((url, index) => (
						<Card key={index} className="relative group overflow-hidden">
							<div className="aspect-square">
								<img src={url} alt={`Venue image ${index + 1}`} className="w-full h-full object-cover" />
							</div>
							<button
								type="button"
								onClick={() => removeImage(index)}
								className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<X className="h-4 w-4" />
							</button>
							{index === 0 && (
								<div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
									Primary
								</div>
							)}
						</Card>
					))}
				</div>
			)}

			{/* Empty State */}
			{images.length === 0 && !uploading && (
				<Card className="p-8 border-dashed">
					<div className="flex flex-col items-center justify-center text-center">
						<ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-sm text-muted-foreground">
							No images uploaded yet. Click the button above to add images.
						</p>
					</div>
				</Card>
			)}
		</div>
	);
};

export default ImageUpload;
