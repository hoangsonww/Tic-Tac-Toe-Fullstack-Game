import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Avatar,
  Button,
} from "@mui/material";
import {
  GitHub,
  LinkedIn,
  Facebook,
  Instagram,
  Twitter,
  Edit as EditIcon,
  Save as SaveIcon,
  AccountCircle,
  SportsEsports,
  Cake,
  Info,
} from "@mui/icons-material";
import { api } from "../utils/api";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loadingPlatform, setLoadingPlatform] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch profile data
  useEffect(() => {
    api
      .get("/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setProfile(response.data);
        setError(""); // Clear previous errors
      })
      .catch((error) => {
        console.error("Failed to fetch profile:", error);
        setError("Failed to load profile data.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Toggle edit mode for a specific field
  const handleEditToggle = (field: string) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle profile state changes for specific fields
  const handleProfileChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  // Save changes for a specific field
  const handleFieldSave = async (field: string) => {
    setSavingField(field);
    setError("");

    try {
      const dataToUpdate: Partial<typeof profile> = {};

      if (field === "dob" || field === "bio") {
        dataToUpdate[field] = profile[field];
      } else if (
        field in profile.socialMedia ||
        !profile.socialMedia?.[field]
      ) {
        dataToUpdate.socialMedia = {
          ...(profile.socialMedia || {}),
          [field]: profile.socialMedia?.[field] || "",
        };
      }

      await api.put("/profile", dataToUpdate, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert(`${field.toUpperCase()} updated successfully!`);
      setIsEditing((prev) => ({ ...prev, [field]: false })); // Close edit mode
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      setError(`Failed to update ${field}. Please try again.`);
    } finally {
      setSavingField(null);
    }
  };

  const formatSocialLink = (platform: string, username: string) => {
    const baseUrls: Record<string, string> = {
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      twitter: "https://twitter.com/",
    };
    return username ? `${baseUrls[platform]}${username}` : "";
  };

  const extractUsername = (url: string) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:github\.com|linkedin\.com\/in|facebook\.com|instagram\.com|twitter\.com|x\.com)\/([\w-]+)/i,
    );
    return match ? match[1] : url; // Return the username if matched, else return the input
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      socialMedia: {
        ...(prev.socialMedia || {}),
        [platform]: extractUsername(value),
      },
    }));
  };

  const handleSocialMediaSave = async (platform: string) => {
    setLoadingPlatform((prevState) => ({ ...prevState, [platform]: true }));
    setError("");

    try {
      const updatedSocialMedia = {
        ...profile.socialMedia,
        [platform]: profile.socialMedia?.[platform] || "",
      };

      const dataToUpdate = { socialMedia: updatedSocialMedia };

      await api.put("/profile", dataToUpdate, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert(
        `${platform.charAt(0).toUpperCase() + platform.slice(1)} updated successfully!`,
      );
      setIsEditing((prev) => ({ ...prev, [platform]: false })); // Close edit mode
    } catch (err) {
      console.error(`Failed to update ${platform}:`, err);
      setError(`Failed to update ${platform}. Please try again.`);
    } finally {
      setLoadingPlatform((prevState) => ({ ...prevState, [platform]: false }));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter") {
      if (field in profile.socialMedia) {
        handleSocialMediaSave(field);
      } else {
        handleFieldSave(field);
      }
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h6" color="error" sx={{ fontFamily: "Poppins" }}>
          Unable to load profile data.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 450,
        mx: "auto",
        mt: 5,
        mb: 5,
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "Poppins", textAlign: "center", fontWeight: "bold" }}
      >
        User Profile
      </Typography>
      <Box display="flex" justifyContent="center" mb={3}>
        <Avatar
          src={profile.profilePicture || "/OIP.jpg"}
          alt={profile.username || "User"}
          sx={{ width: 120, height: 120, border: "3px solid #1976d2" }}
        />
      </Box>
      <Box>
        {error && (
          <Typography
            color="error"
            mb={2}
            textAlign="center"
            sx={{ fontFamily: "Poppins" }}
          >
            {error}
          </Typography>
        )}
        <Box mb={2} display="flex" alignItems="center" justifyContent="center">
          <AccountCircle sx={{ mr: 1, color: "#1976d2" }} />
          <Typography variant="subtitle1" sx={{ fontFamily: "Poppins" }}>
            <strong>Username:</strong> {profile.username}
          </Typography>
        </Box>
        <Box mb={2} display="flex" alignItems="center" justifyContent="center">
          <SportsEsports sx={{ mr: 1, color: "#1976d2" }} />
          <Typography variant="subtitle1" sx={{ fontFamily: "Poppins" }}>
            <strong>ELO:</strong> {profile.elo || "N/A"}
          </Typography>
        </Box>
        <Box mb={2} display="flex" alignItems="center" justifyContent="center">
          <Cake sx={{ mr: 1, color: "#1976d2" }} />
          <Typography variant="subtitle1" sx={{ fontFamily: "Poppins" }}>
            <strong>Date of Birth:</strong>{" "}
            {isEditing.dob ? (
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={profile.dob || ""}
                onChange={(e) => handleProfileChange("dob", e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleFieldSave("dob")}
                sx={{ fontFamily: "Poppins" }}
                inputProps={{
                  style: {
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
                InputLabelProps={{
                  style: {
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
              />
            ) : (
              profile.dob || "N/A"
            )}
            <IconButton
              onClick={() => {
                if (isEditing.dob) {
                  handleFieldSave("dob");
                } else {
                  handleEditToggle("dob");
                }
              }}
            >
              {isEditing.dob ? (
                savingField === "dob" ? (
                  <CircularProgress size={20} />
                ) : (
                  <SaveIcon />
                )
              ) : (
                <EditIcon />
              )}
            </IconButton>
          </Typography>
        </Box>
        <Box mb={2} display="flex" alignItems="center" justifyContent="center">
          <Info sx={{ mr: 1, color: "#1976d2" }} />
          <Typography variant="subtitle1" sx={{ fontFamily: "Poppins" }}>
            <strong>Bio:</strong>{" "}
            {isEditing.bio ? (
              <TextField
                fullWidth
                multiline
                label="Bio"
                rows={3}
                value={profile.bio || ""}
                onChange={(e) => handleProfileChange("bio", e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleFieldSave("bio")}
                sx={{ fontFamily: "Poppins" }}
                inputProps={{
                  style: {
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
                InputLabelProps={{
                  style: {
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
              />
            ) : (
              profile.bio || "No bio set"
            )}
            <IconButton
              onClick={() => {
                if (isEditing.bio) {
                  handleFieldSave("bio");
                } else {
                  handleEditToggle("bio");
                }
              }}
            >
              {isEditing.bio ? (
                savingField === "bio" ? (
                  <CircularProgress size={20} />
                ) : (
                  <SaveIcon />
                )
              ) : (
                <EditIcon />
              )}
            </IconButton>
          </Typography>
        </Box>
        {["github", "linkedin", "facebook", "instagram", "twitter"].map(
          (platform) => (
            <Box
              key={platform}
              mb={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {platform === "github" && (
                <GitHub sx={{ mr: 1, color: "#1976d2" }} />
              )}
              {platform === "linkedin" && (
                <LinkedIn sx={{ mr: 1, color: "#1976d2" }} />
              )}
              {platform === "facebook" && (
                <Facebook sx={{ mr: 1, color: "#1976d2" }} />
              )}
              {platform === "instagram" && (
                <Instagram sx={{ mr: 1, color: "#1976d2" }} />
              )}
              {platform === "twitter" && (
                <Twitter sx={{ mr: 1, color: "#1976d2" }} />
              )}
              {isEditing[platform] ? (
                <TextField
                  fullWidth
                  label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  value={profile.socialMedia?.[platform] || ""}
                  onChange={(e) =>
                    handleSocialMediaChange(platform, e.target.value)
                  }
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSocialMediaSave(platform)
                  }
                  sx={{ fontFamily: "Poppins" }}
                  inputProps={{
                    style: {
                      fontFamily: "Poppins, sans-serif",
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      fontFamily: "Poppins, sans-serif",
                    },
                  }}
                />
              ) : (
                <Button
                  href={formatSocialLink(
                    platform,
                    profile.socialMedia?.[platform],
                  )}
                  target="_blank"
                  sx={{ fontFamily: "Poppins" }}
                >
                  {profile.socialMedia?.[platform] || "Not Set"}
                </Button>
              )}
              <IconButton
                onClick={() => {
                  if (isEditing[platform]) {
                    handleSocialMediaSave(platform);
                  } else {
                    handleEditToggle(platform);
                  }
                }}
              >
                {isEditing[platform] ? (
                  loadingPlatform[platform] ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SaveIcon />
                  )
                ) : (
                  <EditIcon />
                )}
              </IconButton>
            </Box>
          ),
        )}
      </Box>
    </Box>
  );
};

export default Profile;
