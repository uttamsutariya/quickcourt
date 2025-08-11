import apiClient from "@/lib/api-client";

export interface UploadResponse {
	success: boolean;
	url: string;
	publicId: string;
}

export interface MultiUploadResponse {
	success: boolean;
	images: Array<{
		url: string;
		publicId: string;
	}>;
}

class UploadService {
	async uploadImage(file: File): Promise<UploadResponse> {
		const formData = new FormData();
		formData.append("image", file);

		const response = await apiClient.post<UploadResponse>("/upload/image", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		return response.data;
	}

	async uploadImages(files: File[]): Promise<MultiUploadResponse> {
		const formData = new FormData();
		files.forEach((file) => {
			formData.append("images", file);
		});

		const response = await apiClient.post<MultiUploadResponse>("/upload/images", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		return response.data;
	}

	async deleteImage(publicId: string): Promise<void> {
		await apiClient.delete("/upload/image", {
			data: { publicId },
		});
	}
}

export default new UploadService();
