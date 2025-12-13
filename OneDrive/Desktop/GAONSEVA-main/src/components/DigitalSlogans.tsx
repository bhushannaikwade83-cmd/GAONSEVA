import React from "react";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";

interface Slogan {
  marathi: string;
  english: string;
}

const slogans: Slogan[] = [
  { marathi: "झाडे लावा, झाडे जपवा", english: "Plant Trees, Save Trees" },
  { marathi: "पाणी अडवा, पाणी जिरवा", english: "Save Water, Save Life" },
  { marathi: "व्यायाम करा, बलवान व्हा", english: "Do Exercise, Be Strong" },
  { marathi: "मुलगी वाचवा, मुलगी शिकवा", english: "Save Girl, Educate Girl" }
];

const DigitalSlogans: React.FC = () => {
  return (
    <Box sx={{ width: "100%", bgcolor: "#e6f0fa", color: "rgba(0, 0, 0, 1)", py: 4 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
          sx={{ fontFamily: "monospace", letterSpacing: 1, mb: 3 }}
        >
          संदेश
        </Typography>

        <Grid container spacing={2}>
          {slogans.map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  bgcolor: "#658dc6",
                  color: "#0ff",
                  textAlign: "center",
                  fontFamily: "monospace",
                  border: "1px solid #0ff",
                  animation: `glow 2s ease-in-out infinite alternate`,
                  '@keyframes glow': {
                    'from': {
                      boxShadow: '0 0 5px #0ff',
                    },
                    'to': {
                      boxShadow: '0 0 20px #0ff, 0 0 30px #0ff',
                    },
                  },
                }}
              >
                <Typography variant="h6">{item.marathi}</Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 1, color: "#0f0" }}
                >
                  {item.english}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default DigitalSlogans;
