import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PersonIcon from "@mui/icons-material/Person";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const GeneralMembersSection = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const socialIconMap = {
    facebook: <FacebookIcon sx={{ color: "#3b5998" }} />,
    twitter: <TwitterIcon sx={{ color: "#00acee" }} />,
    linkedin: <LinkedInIcon sx={{ color: "#0e76a8" }} />,
    instagram: <InstagramIcon sx={{ color: "#E1306C" }} />,
  };

  useEffect(() => {
    const fetchMembersData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch members data (name, image, role)
        const membersQuery = query(
          collection(db, "members"),
          orderBy("order", "asc")
        );
        const membersSnapshot = await getDocs(membersQuery);
        const membersData = membersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch bio data (bio, social links)
        const bioQuery = query(collection(db, "members-bio"));
        const bioSnapshot = await getDocs(bioQuery);
        const bioData = bioSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Combine data by matching member IDs
        const combinedMembers = membersData.map((member) => {
          const bioInfo = bioData.find((bio) => bio.id === member.id);
          return {
            ...member,
            bio: bioInfo?.bio || "माहिती उपलब्ध नाही",
            social: {
              facebook: bioInfo?.facebook || "",
              twitter: bioInfo?.twitter || "",
              linkedin: bioInfo?.linkedin || "",
              instagram: bioInfo?.instagram || "",
            },
          };
        });

        // Filter for general members (सदस्य)
        const generalMembers = combinedMembers.filter((m) =>
          m.designation === "सदस्य"
        );

        setMembers(generalMembers);
      } catch (err) {
        console.error("Error fetching members data:", err);
        setError("सदस्यांची माहिती आणण्यात त्रुटी आली");
      } finally {
        setLoading(false);
      }
    };

    fetchMembersData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          padding: { xs: "20px 10px", md: "40px 20px" },
          backgroundColor: "#f5f7fa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          सदस्यांची माहिती आणत आहे...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          padding: { xs: "20px 10px", md: "40px 20px" },
          backgroundColor: "#f5f7fa",
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: { xs: "20px 10px", md: "40px 20px" },
        backgroundColor: "#FFFFFF",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{
          fontWeight: "bold",
          marginBottom: 5,
          color: "#2c3e50",
        }}
      >
        ग्रामपंचायत सदस्य
      </Typography>

      {members.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <PersonIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>
            सदस्य माहिती उपलब्ध नाही
          </Typography>
          <Typography variant="body2">
            कृपया प्रशासकांशी संपर्क साधा
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {members.map((member) => (
            <Grid item xs={12} sm={6} md={3} key={member.id}>
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
                  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-12px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Box sx={{ position: "relative", p: 3, background: 'linear-gradient(45deg, #3498db 30%, #2196f3 90%)', color: 'white' }}>
                  <Avatar
                    src={member.imageURL || member.photoURL}
                    alt={member.name}
                    sx={{
                      width: 120,
                      height: 120,
                      margin: "0 auto",
                      border: "5px solid #fff",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    {!(member.imageURL || member.photoURL) && (
                      <PersonIcon sx={{ fontSize: 70 }} />
                    )}
                  </Avatar>
                </Box>
                <CardContent sx={{ textAlign: 'center', p: 3, flexGrow: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#2c3e50", mb: 0.5 }}
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="primary.main"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {member.designation || member.role}
                  </Typography>
                  <Divider sx={{ my: 2 }}/>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, minHeight: '60px' }}
                  >
                    {member.bio}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    justifyContent="center"
                  >
                    {Object.entries(member.social)
                      .filter(([_, link]) => link && link.trim() !== "")
                      .map(([platform, link]) => (
                        <IconButton
                          key={platform}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            border: '1px solid #ddd', 
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.2)',
                              borderColor: socialIconMap[platform].props.sx.color,
                              color: socialIconMap[platform].props.sx.color
                            }
                          }}
                        >
                          {socialIconMap[platform]}
                        </IconButton>
                      ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default GeneralMembersSection;
