import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { TextField, Button, Box, Typography } from "@mui/material";

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<any>({});

    useEffect(() => {
        api.get("/profile")
            .then((response) => setProfile(response.data))
            .catch((error) => console.error("Failed to fetch profile:", error));
    }, []);

    const handleUpdate = () => {
        api.put("/profile", profile)
            .then(() => alert("Profile updated!"))
            .catch((error) => console.error("Failed to update profile:", error));
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Profile
            </Typography>
            <TextField
                label="Username"
                value={profile.username || ""}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                fullWidth
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleUpdate} fullWidth>
                Update Profile
            </Button>
        </Box>
    );
};

export default Profile;
