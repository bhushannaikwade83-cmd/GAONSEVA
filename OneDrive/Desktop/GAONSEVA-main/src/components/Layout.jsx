import React from "react";
import { Box } from "@mui/material";

const Layout = ({ children }) => {
  return (
    <Box sx={{ minHeight: "80vh", p: { xs: 2, md: 4 } }}>
      {children}
    </Box>
  );
};

export default Layout;
