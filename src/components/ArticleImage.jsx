import { useState, useEffect } from "react";
import axios from "axios";

const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24px' fill='%23333333'%3ELoading...%3C/text%3E%3C/svg%3E";

const ArticleImage = ({
  imageUrl,
  thumbUrl,
  thumbnailUrl,
  alt,
  className,
  uploadToCloud = false,
}) => {
  // Use thumbnailUrl as a fallback if thumbUrl isn't provided
  const thumbnailSource = thumbUrl || thumbnailUrl || placeholderImage;
  const [imageSrc, setImageSrc] = useState(thumbnailSource);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedToCloud, setUploadedToCloud] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;

    setIsLoading(true);

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      setImageSrc(imageUrl);
      setIsLoading(false);

      // If we should upload to cloud and haven't done so yet
      if (uploadToCloud && !uploadedToCloud) {
        handleCloudinaryUpload(imageUrl);
      }
    };

    img.onerror = () => {
      // Keep showing thumbnail or placeholder on error
      console.log("Image load error, keeping thumbnail:", thumbnailSource);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [
    imageUrl,
    thumbUrl,
    thumbnailUrl,
    uploadToCloud,
    uploadedToCloud,
    thumbnailSource,
  ]);

  const handleCloudinaryUpload = async (imgUrl) => {
    try {
      console.log("Preparing image for cloud upload:", imgUrl);
      // Convert image to base64 if needed
      if (!imgUrl.startsWith("data:")) {
        const response = await fetch(imgUrl);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64data = reader.result;
          await uploadToCloudinary(base64data);
        };

        reader.readAsDataURL(blob);
      } else {
        // Already a base64 string
        await uploadToCloudinary(imgUrl);
      }
    } catch (error) {
      console.error("Error preparing image for upload:", error);
    }
  };

  const uploadToCloudinary = async (base64data) => {
    try {
      console.log("Starting upload to Cloudinary");

      // Convert base64 to Blob
      const fetchResponse = await fetch(base64data);
      const blob = await fetchResponse.blob();

      // Create FormData
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      // Use axios directly to ensure correct content type
      const response = await axios.post(
        baseUrl,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log("Image uploaded to Cloudinary:", response.data);
      setUploadedToCloud(true);
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
    }
  };

  return (
    <div className={`article-image-container relative ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${
          isLoading ? "opacity-60" : "opacity-100"
        } transition-opacity duration-300`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default ArticleImage;
