import React from "react";
import { Box } from "@mui/material";

const Layout = ({ children }) => {
  return (
    <Box sx={{ 
      minHeight: "80vh", 
      p: { xs: 2, md: 4 },
      backgroundColor: '#fafafa',
      backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)'
    }}>
      {children}
    </Box>
  );
};

export default Layout;
