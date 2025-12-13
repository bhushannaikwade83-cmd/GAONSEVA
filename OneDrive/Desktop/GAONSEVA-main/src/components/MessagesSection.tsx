import React, { useState, SyntheticEvent } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Link as MuiLink,
  Paper,
} from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const MessagesSection: React.FC = () => {
  const [value, setValue] = useState<number>(0);

  const handleChange = (event: SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: 350,
        mt: 4,
        ml: 2,
        boxShadow: 3,
        borderRadius: 2,
        background: "white",
      }}
    >
      <Paper square>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": { fontWeight: "bold", fontSize: "14px" },
            "& .Mui-selected": {
              backgroundColor: "#d98c00",
              color: "white !important",
            },
          }}
        >
          <Tab label="नवीन संदेश" />
          <Tab label="कार्यक्रम" />
          <Tab label="निविदा" />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No new messages
          </Typography>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No upcoming events
          </Typography>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No tenders available
          </Typography>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default MessagesSection;
