import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const Gramjanganna = () => {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const q = query(collection(db, "census"), orderBy("year", "desc"), limit(10));
    const snap = await getDocs(q);
    setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load();
  }, []);

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
                <TableCell>Year</TableCell>
                <TableCell>Total Population</TableCell>
                <TableCell>Male</TableCell>
                <TableCell>Female</TableCell>
                <TableCell>Children (&lt;18)</TableCell>
                <TableCell>Seniors (60+)</TableCell>
                <TableCell>Families</TableCell>
                <TableCell>Literacy Rate (%)</TableCell>
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
