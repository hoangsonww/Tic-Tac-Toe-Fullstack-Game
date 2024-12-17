import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Avatar,
  Button,
  InputAdornment,
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
  Search,
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
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentUserUsername, setCurrentUserUsername] = useState("");
  const [isCurrentUser, setIsCurrentUser] = useState(true);

  const defaultAvatars = [
    "/OIP.jpg",
    "/OIP2.webp",
    "/OIP3.png",
    "/OIP4.png",
    "/OIP5.png",
    "/OIP6.webp",
    "/OIP7.webp",
    "/OIP8.webp",
    "/OIP9.webp",
    "/OIP10.webp",
    "/OIP11.webp",
    "/OIP12.webp",
    "/OIP13.webp",
    "/OIP14.webp",
    "/OIP15.webp",
    "/OIP16.webp",
    "/OIP17.webp",
    "/OIP18.webp",
    "/OIP19.webp",
    "/OIP20.webp",
  ];
  const lastDefaultAvatarIndexRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentDefaultAvatar, setCurrentDefaultAvatar] = useState<string>(
    () => {
      const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
      lastDefaultAvatarIndexRef.current = randomIndex;
      return defaultAvatars[randomIndex];
    },
  );

  // Fetch current user's username on mount
  useEffect(() => {
    api
      .get("/profile", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setCurrentUserUsername(response.data.username);
      })
      .catch((error) => {
        console.error("Failed to fetch current user's username:", error);
      });
  }, []);

  // Fetch profile data based on searchQuery, with debounce of 750ms
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setLoading(true);
      setError("");

      let endpoint = "/profile";
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };

      if (searchQuery.trim() !== "") {
        endpoint = `/profile/search?username=${encodeURIComponent(
          searchQuery.trim(),
        )}`;
      }

      api
        .get(endpoint, {
          headers,
        })
        .then((response) => {
          setProfile(response.data);
          setError("");

          if (searchQuery.trim() === "") {
            setIsCurrentUser(true);
          } else {
            setIsCurrentUser(response.data.username === currentUserUsername);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch profile:", error);
          if (error.response && error.response.status === 404) {
            setError("User not found.");
          } else {
            setError("Failed to load profile data.");
          }
          setProfile(null);
        })
        .finally(() => setLoading(false));
    }, 750);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, currentUserUsername]);

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
      if (field === "dob") {
        const minDate = new Date("1900-01-01");
        const maxDate = new Date();
        const selectedDate = new Date(profile.dob);

        if (selectedDate < minDate || selectedDate > maxDate) {
          alert("Date of Birth must be between January 1, 1900, and today.");
          setSavingField(null); // Reset the saving state
          return; // Do not proceed with saving
        }
      }

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
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      alert(`${field.toUpperCase()} updated successfully!`);
      setIsEditing((prev) => ({ ...prev, [field]: false }));
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
    return match ? match[1] : url;
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
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      alert(
        `${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } updated successfully!`,
      );
      setIsEditing((prev) => ({ ...prev, [platform]: false }));
    } catch (err) {
      console.error(`Failed to update ${platform}:`, err);
      setError(`Failed to update ${platform}. Please try again.`);
    } finally {
      setLoadingPlatform((prevState) => ({
        ...prevState,
        [platform]: false,
      }));
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

  return (
    <Box sx={{ mt: 5, mb: 5 }}>
      {/* Search Field */}
      <Box
        sx={{
          maxWidth: 450,
          minWidth: { xs: "90%", sm: 450 },
          mx: "auto",
          mb: 3,
        }}
      >
        <TextField
          label="Search for Players"
          fullWidth
          margin="normal"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiInputBase-input": {
              fontFamily: "Poppins",
            },
            "& .MuiInputLabel-root": {
              fontFamily: "Poppins",
            },
          }}
        />
      </Box>

      {error ? (
        <Box textAlign="center">
          <Typography variant="h6" color="error" sx={{ fontFamily: "Poppins" }}>
            {error}
          </Typography>
        </Box>
      ) : (
        profile && (
          <Box
            sx={{
              maxWidth: 450,
              minWidth: { xs: "90%", sm: 450 },
              mx: "auto",
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
              sx={{
                fontFamily: "Poppins",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              User Profile
            </Typography>
            <Box display="flex" justifyContent="center" mb={3}>
              <Avatar
                src={profile.profilePicture || currentDefaultAvatar}
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
              <Box
                mb={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <AccountCircle sx={{ mr: 1, color: "#1976d2" }} />
                <Typography variant="subtitle1" sx={{ fontFamily: "Poppins" }}>
                  <strong>Username:</strong> {profile.username}
                </Typography>
              </Box>
              <Box
                mb={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <SportsEsports sx={{ mr: 1, color: "#1976d2" }} />
                <Typography variant="subtitle1" sx={{ fontFamily: "Poppins" }}>
                  <strong>ELO:</strong> {profile.elo || "N/A"}
                </Typography>
              </Box>
              <Box
                mb={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Cake sx={{ mr: 1, color: "#1976d2" }} />
                <Typography variant="subtitle1" sx={{ fontFamily: "Poppins" }}>
                  <strong>Date of Birth:</strong>{" "}
                  {isCurrentUser && isEditing.dob ? (
                    <TextField
                      fullWidth
                      type="date"
                      label="Date of Birth"
                      value={profile.dob || ""}
                      onChange={(e) =>
                        handleProfileChange("dob", e.target.value)
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleFieldSave("dob")
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
                    profile.dob || "N/A"
                  )}
                  {isCurrentUser && (
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
                  )}
                </Typography>
              </Box>
              <Box
                mb={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Info sx={{ mr: 1, color: "#1976d2" }} />
                <Typography variant="subtitle1" sx={{ fontFamily: "Poppins" }}>
                  <strong>Bio:</strong>{" "}
                  {isCurrentUser && isEditing.bio ? (
                    <TextField
                      fullWidth
                      multiline
                      label="Bio"
                      rows={3}
                      value={profile.bio || ""}
                      onChange={(e) =>
                        handleProfileChange("bio", e.target.value)
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleFieldSave("bio")
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
                    profile.bio || "No bio set"
                  )}
                  {isCurrentUser && (
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
                  )}
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
                    {isCurrentUser && isEditing[platform] ? (
                      <TextField
                        fullWidth
                        label={
                          platform.charAt(0).toUpperCase() + platform.slice(1)
                        }
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
                    ) : profile.socialMedia?.[platform] ? (
                      <Button
                        href={formatSocialLink(
                          platform,
                          profile.socialMedia?.[platform],
                        )}
                        target="_blank"
                        sx={{ fontFamily: "Poppins" }}
                      >
                        {profile.socialMedia?.[platform]}
                      </Button>
                    ) : (
                      <Typography
                        variant="subtitle1"
                        sx={{ fontFamily: "Poppins" }}
                      >
                        Not Set
                      </Typography>
                    )}
                    {isCurrentUser && (
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
                    )}
                  </Box>
                ),
              )}
            </Box>
          </Box>
        )
      )}
    </Box>
  );
};

export default Profile;
