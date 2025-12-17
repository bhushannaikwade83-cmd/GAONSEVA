import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  LinearProgress,
  Grid,
  IconButton,
} from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";

const CloudinaryMultiUploader = ({
  onUploadSuccess,
  onUploadError,
  title = "फोटो अपलोड करा",
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]); // stores all uploaded URLs
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFilesSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setError("");
    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        const msg = "फक्त इमेज फाइल निवडा";
        setError(msg);
        onUploadError?.(msg);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "grampanchayat");
      formData.append("folder", "grampanchayat/photos");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/ddgojykpf/image/upload",
          { method: "POST", body: formData }
        );

        const data = await res.json();
        if (!res.ok || !data.secure_url) {
          throw new Error(data.error?.message || "Upload failed");
        }

        uploadedUrls.push(data.secure_url);
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (err) {
        setError(err.message);
        onUploadError?.(err.message);
      }
    }

    // ✅ Add new images to existing list
    setUploadedImages((prev) => [...prev, ...uploadedUrls]);

    setUploading(false);
    setUploadProgress(100);
    onUploadSuccess?.(uploadedUrls);
  };

  const handleRemove = (url) => {
    const updated = uploadedImages.filter((img) => img !== url);
    setUploadedImages(updated);
    onUploadSuccess?.(updated);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {title}
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFilesSelect}
        disabled={uploading || disabled}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {uploading && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">अपलोड होत आहे...</Typography>
          </Box>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      <Button
        type="button"
        variant="contained"
        startIcon={<PhotoCamera />}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        disabled={uploading || disabled}
        sx={{ borderRadius: 2, mb: 3 }}
      >
        नवीन फोटो अपलोड करा
      </Button>

      {uploadedImages.length > 0 ? (
        <Grid container spacing={2}>
          {uploadedImages.map((url, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 1,
                }}
              >
                <img
                  src={url}
                  alt={`uploaded-${index}`}
                  style={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemove(url)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(255,255,255,0.9)",
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          अजून कोणतेही फोटो अपलोड केलेले नाहीत.
        </Typography>
      )}
    </Paper>
  );
};

export default CloudinaryMultiUploader;
