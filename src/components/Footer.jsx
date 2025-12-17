import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import ChatIcon from "@mui/icons-material/Chat";

const footerLinks = [
  {
    title: "सरकारी दुवे",
    links: [
      { name: "महाराष्ट्र शासन", url: "https://www.maharashtra.gov.in/" },
      { name: "आपले सरकार", url: "https://aaplesarkar.mahaonline.gov.in/" },
      { name: "७/१२", url: "https://mahabhulekh.maharashtra.gov.in/" },
      { name: "आपली चावडी", url: "https://mahabhumi.gov.in/mahabhumilink" },
      { name: "पीक विमा", url: "https://pmfby.gov.in/" },
      { name: "पण सेवा", url: "https://services.india.gov.in/" },
      { name: "सॉईल हेल्थ कार्ड", url: "https://soilhealth.dac.gov.in/" },
      { name: "कृषि एवं किसान कल्याण मंत्रालय", url: "https://agricoop.gov.in/" },
      { name: "डिजिटल लॉकर", url: "https://digitallocker.gov.in/" },
      { name: "महाडिबीटी", url: "https://mahadbt.maharashtra.gov.in/" },
      { name: "ई-पॉस", url: "https://epos.maharashtra.gov.in/" },
      { name: "प्लॅन प्लस", url: "https://planplus.nic.in/" },
      { name: "उमंग अ‍ॅप", url: "https://web.umang.gov.in/" },
      { name: "मुद्रा योजना", url: "https://www.mudra.org.in/" },
      { name: "महावितरण पोर्टल", url: "https://www.mahadiscom.in/" },
      { name: "सामान्य सेवा केंद्र", url: "https://csc.gov.in/" },
    ],
  },
  {
    title: "सेवा आणि विभाग",
    links: [
      { name: "महाराष्ट्र पोलीस", url: "https://www.mahapolice.gov.in/" },
      { name: "ग्राहक हेल्पलाईन", url: "https://consumerhelpline.gov.in/" },
      { name: "उपभोक्ता मामले विभाग", url: "https://consumeraffairs.nic.in/" },
      { name: "नाबार्ड", url: "https://www.nabard.org/" },
      { name: "शासन निर्णय", url: "https://gr.maharashtra.gov.in/" },
      { name: "महाऑनलाईन लिमिटेड", url: "https://mahaonline.gov.in/" },
      { name: "कृषी विभाग", url: "https://krishi.maharashtra.gov.in/" },
      { name: "सामाजिक न्याय आणि विशेष सहाय्य विभाग", url: "https://sjsa.maharashtra.gov.in/" },
      { name: "लघुउद्योग प्रतिवंधक विभाग", url: "https://dcmsme.gov.in/" },
      { name: "रोजगार हमी योजना", url: "https://egs.maharashtra.gov.in/" },
      { name: "ग्राम विकास विभाग", url: "https://rdd.maharashtra.gov.in/" },
      { name: "पंचायती राज विभाग", url: "https://prdd.maharashtra.gov.in/" },
      { name: "एम-पासपोर्ट सेवा एप", url: "https://portal2.passportindia.gov.in/" },
      { name: "र.प.महामंडळ", url: "https://msrtc.maharashtra.gov.in/" },
      { name: "उद्योग नोंदणी", url: "https://udyamregistration.gov.in/" },
      { name: "एमएसएमई", url: "https://msme.gov.in/" },
    ],
  },
  {
    title: "महत्वाचे पोर्टल",
    links: [
      { name: "हवामान विभाग", url: "https://mausam.imd.gov.in/" },
      { name: "भुवन प्रेप", url: "https://bhuvan.nrsc.gov.in/" },
      { name: "स्वच्छ भारत", url: "https://swachhbharat.mygov.in/" },
      { name: "युआयडीएआय", url: "https://uidai.gov.in/" },
      { name: "स्टार्ट अप इंडिया", url: "https://www.startupindia.gov.in/" },
      { name: "मेक इन इंडिया", url: "https://www.makeinindia.com/" },
      { name: "किसान पोर्टल", url: "https://farmer.gov.in/" },
      { name: "कौशल्य विकास", url: "https://www.skillindia.gov.in/" },
      { name: "ग्रामीण विकास मंत्रालय", url: "https://rural.nic.in/" },
      { name: "महाराष्ट्र विधानसभा", url: "https://mls.org.in/" },
      { name: "महा न्यूज", url: "https://mahanews.gov.in/" },
      { name: "एम-परिवहन एप", url: "https://parivahan.gov.in/" },
      { name: "भीम एप", url: "https://www.bhimupi.org.in/" },
      { name: "महारसायन", url: "https://maharashtrasynod.org/" },
      { name: "स्हाडा", url: "https://mhada.gov.in/" },
      { name: "जीएसटी पोर्टल", url: "https://www.gst.gov.in/" },
    ],
  },
  {
    title: "शिक्षण आणि माहिती",
    links: [
      { name: "माहिती केंद्र", url: "https://www.india.gov.in/" },
      { name: "माहितीचा अधिकार", url: "https://rti.gov.in/" },
      { name: "विकासपीडिया", url: "https://vikaspedia.in/" },
      { name: "ई-पाठशाळा", url: "https://epathshala.nic.in/" },
      { name: "राष्ट्रीय डिजिटल पुस्तकालय", url: "https://ndl.iitkgp.ac.in/" },
      { name: "बालभारती पुस्तके", url: "https://cart.ebalbharati.in/" },
      { name: "एनसीईआरटी पुस्तके", url: "https://ncert.nic.in/textbook.php" },
      { name: "एनपीटीएल", url: "https://nptel.ac.in/" },
      { name: "विद्यापीठे", url: "https://www.ugc.ac.in/" },
      { name: "ई-कोर्ट", url: "https://ecourts.gov.in/" },
      { name: "ई-हॉस्पिटल", url: "https://ehospital.nic.in/" },
      { name: "e-gov ॲप स्टोअर", url: "https://apps.mgov.gov.in/" },
      { name: "पॅन कार्ड", url: "https://www.onlineservices.nsdl.com/paam/endUser RegisterContact.html" },
      { name: "आयआरसीटीसी", url: "https://www.irctc.co.in/" },
      { name: "मैत्री पोर्टल", url: "https://maitri.mahaonline.gov.in/" },
      { name: "महाराष्ट्र राज्य नांदिवता सोसायटी", url: "https://msrls.maharashtra.gov.in/" },
    ],
  },
];

const bottomLinks = [
  { name: "वेबसाईट धोरणे", url: "#" },
  { name: "आमच्याशी संपर्क साधा", url: "#" },
  { name: "अटी आणि शर्ती", url: "#" },
  { name: "साईटमॅप", url: "#" },
  { name: "अभिप्राय", url: "#" },
  { name: "मिडिया गॅलरी", url: "#" },
];

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1976d2",
        color: "rgba(255,255,255,0.9)",
        mt: 0,
        pt: { xs: 4, sm: 5, md: 6 },
        pb: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 },
        fontFamily: "'Roboto', sans-serif",
        userSelect: "none",
        borderTop: "4px solid #1565c0",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Main Links Grid */}
        <Grid container spacing={{ xs: 3, sm: 4 }}>
          {footerLinks.map(({ title, links }, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Typography
                variant="h6"
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  color: "#FFD700",
                  fontWeight: "700",
                  borderBottom: "2px solid #FFD700",
                  pb: 0.5,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {title}
              </Typography>
              {links.map((link, i) => (
                <Typography 
                  key={i} 
                  variant="body2" 
                  sx={{ 
                    mb: { xs: 0.75, sm: 1 },
                    fontSize: { xs: "0.8rem", sm: "0.875rem" }
                  }}
                >
                  <Link
                    href={link.url}
                    underline="hover"
                    color="inherit"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      transition: "color 0.3s",
                      "&:hover": { color: "#FFD700" },
                      display: "inline-block",
                      padding: { xs: "4px 0", sm: "2px 0" },
                      minHeight: { xs: "32px", sm: "auto" },
                    }}
                  >
                    {link.name}
                  </Link>
                </Typography>
              ))}
            </Grid>
          ))}
        </Grid>

        {/* Divider */}
        <Divider
          sx={{ bgcolor: "rgba(255,255,255,0.3)", my: 4, maxWidth: "100%", borderWidth: "1px" }}
        />

        {/* Bottom Links */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 2, sm: 3, md: 4 },
            flexWrap: "wrap",
            mb: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 0 },
          }}
        >
          {bottomLinks.map((item, idx) => (
            <Typography
              key={idx}
              variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  "&:hover": { color: "#FFD700" },
                  cursor: "pointer",
                  transition: "color 0.3s",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  padding: { xs: "4px 8px", sm: "2px 4px" },
                  minHeight: { xs: "32px", sm: "auto" },
                  display: "flex",
                  alignItems: "center",
                }}
            >
              <Link href={item.url} underline="none" color="inherit">
                {item.name}
              </Link>
            </Typography>
          ))}
        </Box>

        {/* Social Media Icons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 },
          }}
        >
          {[{
            icon: <FacebookIcon />,
            url: "https://facebook.com",
            label: "Facebook",
            color: "#3b5998",
          }, {
            icon: <TwitterIcon />,
            url: "https://twitter.com",
            label: "Twitter",
            color: "#1da1f2",
          }, {
            icon: <ChatIcon />,
            url: "#chat",
            label: "Chat",
            color: "#4caf50",
          }].map(({ icon, url, label, color }, idx) => (
            <IconButton
              key={idx}
              href={url}
              target={url.startsWith("http") ? "_blank" : undefined}
              aria-label={label}
              sx={{
                color: "rgba(255,255,255,0.8)",
                transition: "color 0.3s",
                "&:hover": { color },
                minWidth: { xs: "48px", sm: "40px" },
                minHeight: { xs: "48px", sm: "40px" },
                padding: { xs: "12px", sm: "8px" },
              }}
            >
              {icon}
            </IconButton>
          ))}
        </Box>

        {/* Copyright */}
        <Typography
          variant="body2"
          align="center"
          sx={{ 
            color: "rgba(255,255,255,0.5)", 
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            px: { xs: 2, sm: 0 }
          }}
        >
          कॉपीराइट © 2025 सर्व हक्क सुरक्षित
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;