import React from "react";
import Slider from "react-slick";
import {
  Box,
  Paper,
  Typography,
  Container,
  Link,
  Grid,
  List,
  ListItem,
  ListItemIcon,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
} from "@mui/icons-material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const GrampanchayatInfo: React.FC = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: true,
  };

  const images: string[] = [
    "/images/image1.jpg",
    "/images/image2.jpg",
    "/images/image3.jpg",
    "/images/image4.jpg",
  ];

  return (
    <>
      {/* First Section - Pink Background */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "rgba(250, 0, 87, 1)",
          color: "white",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {/* Column 1 - ग्रामपंचायत */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: "100%",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  ग्रामपंचायत
                </Typography>
                <Typography variant="body1" paragraph>
                  आमच्या ग्रामपंचायत मध्ये आपले स्वागत आहे. आम्ही आमच्या ग्रामस्थांसाठी
                  सर्वोत्तम सुविधा पुरविण्याचा प्रयत्न करतो.
                </Typography>
              </Paper>
            </Grid>

            {/* Column 2 - Image Slider */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ overflow: "hidden" }}>
                <Slider {...sliderSettings}>
                  {images.map((image, index) => (
                    <Box key={index}>
                      <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "250px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/400x250?text=Image+Not+Found";
                        }}
                      />
                    </Box>
                  ))}
                </Slider>
              </Paper>
            </Grid>

            {/* Column 3 - Contact Info */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: "100%",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  संपर्क
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon sx={{ color: "white" }}>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <Typography>ग्रामपंचायत कार्यालय, ता. जि. महाराष्ट्र</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: "white" }}>
                      <PhoneIcon />
                    </ListItemIcon>
                    <Typography>+91 XXXXXXXXXX</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: "white" }}>
                      <EmailIcon />
                    </ListItemIcon>
                    <Typography>info@grampanchayat.com</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: "white" }}>
                      <LanguageIcon />
                    </ListItemIcon>
                    <Link href="https://grampanchayat.com" color="inherit" underline="hover">
                      www.grampanchayat.com
                    </Link>
                  </ListItem>
                </List>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Link href="#" color="inherit">
                    <FacebookIcon />
                  </Link>
                  <Link href="#" color="inherit">
                    <TwitterIcon />
                  </Link>
                  <Link href="#" color="inherit">
                    <InstagramIcon />
                  </Link>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default GrampanchayatInfo;
