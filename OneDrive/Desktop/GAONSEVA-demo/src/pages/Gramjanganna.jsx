import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { getTranslationState } from "../utils/translationService";

const Gramjanganna = () => {
  const [rows, setRows] = useState([]);
  const [language, setLanguage] = useState("mr");

  const load = async () => {
    const q = query(collection(db, "census"), orderBy("year", "desc"), limit(10));
    const snap = await getDocs(q);
    setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load();
    // Check language on mount and when it changes
    const checkLanguage = () => {
      const state = getTranslationState();
      setLanguage(state.currentLanguage || "mr");
    };
    checkLanguage();
    // Check language periodically
    const interval = setInterval(checkLanguage, 1000);
    return () => clearInterval(interval);
  }, []);

  // Table headers based on language
  const headers = language === "mr" ? {
    year: "वर्ष",
    totalPopulation: "एकूण लोकसंख्या",
    male: "पुरुष",
    female: "महिला",
    children: "मुले (18 वर्षाखाली)",
    seniors: "वृद्ध (60+)",
    families: "कुटुंब",
    literacyRate: "साक्षरता दर (%)"
  } : {
    year: "Year",
    totalPopulation: "Total Population",
    male: "Male",
    female: "Female",
    children: "Children (<18)",
    seniors: "Seniors (60+)",
    families: "Families",
    literacyRate: "Literacy Rate (%)"
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "80vh" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
        जनगणना
      </Typography>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{headers.year}</TableCell>
                <TableCell>{headers.totalPopulation}</TableCell>
                <TableCell>{headers.male}</TableCell>
                <TableCell>{headers.female}</TableCell>
                <TableCell>{headers.children}</TableCell>
                <TableCell>{headers.seniors}</TableCell>
                <TableCell>{headers.families}</TableCell>
                <TableCell>{headers.literacyRate}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.year}</TableCell>
                  <TableCell>{r.totalPopulation}</TableCell>
                  <TableCell>{r.male}</TableCell>
                  <TableCell>{r.female}</TableCell>
                  <TableCell>{r.children}</TableCell>
                  <TableCell>{r.seniors}</TableCell>
                  <TableCell>{r.families}</TableCell>
                  <TableCell>{r.literacyRate}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">माहिती उपलब्ध नाही</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Gramjanganna;
