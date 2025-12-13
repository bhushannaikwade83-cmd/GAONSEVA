import React, { useState, useEffect } from "react";
import { Grid, Typography, Box, Avatar, Paper, CircularProgress, Divider } from "@mui/material";
import Layout from "../components/Layout";
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

const GrampanchayatSadasya = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gpName, setGpName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Members
                const membersCollectionRef = collection(db, 'members');
                const q = query(membersCollectionRef, orderBy("order", "asc"));
                const membersSnap = await getDocs(q);
                setMembers(membersSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

                // Fetch Gram Panchayat Name
                const profileDocRef = doc(db, 'grampanchayat', 'profile');
                const profileSnap = await getDoc(profileDocRef);
                if (profileSnap.exists() && profileSnap.data().title) {
                    setGpName(profileSnap.data().title);
                }

            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const officeBearers = members.filter(m => ["सरपंच", "उपसरपंच", "ग्राम सेवक", "ग्राम सेवक (Gram Sevak)"].includes(m.designation));
    const generalMembers = members.filter(m => m.designation === "सदस्य");

    const MemberCard = ({ member, index }) => (
        <Grid item xs={12} sm={6} md={4}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.03 }}
            >
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 3,
                        display: "flex", 
                        alignItems: "center", 
                        gap: 3, 
                        height: '100%',
                        borderRadius: '16px',
                        border: '1px solid #e0e0e0',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '6px',
                            backgroundColor: 'primary.main',
                            transition: 'height 0.3s ease-in-out',
                        },
                        '&:hover:before': {
                            height: '8px',
                        }
                    }}
                >
                    <Avatar 
                        src={member.imageURL || member.photoURL} 
                        alt={member.name} 
                        sx={{ 
                            width: 80, 
                            height: 80,
                            border: '3px solid white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }} 
                    />
                    <Box>
                        <Typography variant="h5" component="div" fontWeight="700">
                            {member.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight="500">
                            {member.designation}
                        </Typography>
                    </Box>
                </Paper>
            </motion.div>
        </Grid>
    );

    return (
        <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            <Layout>
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        {gpName ? `${gpName} - सदस्य` : 'ग्रामपंचायत सदस्य'}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        येथे आपल्या ग्रामपंचायतीचे सर्व सदस्य दर्शविले आहेत.
                    </Typography>
                </Box>

                {loading ? (
                     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, minHeight: '30vh' }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>सदस्यांची माहिती लोड होत आहे...</Typography>
                     </Box>
                ) : (
                    <>
                        {officeBearers.length > 0 && (
                            <Box mb={6}>
                                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ pl: 1 }}>पदाधिकारी</Typography>
                                <Divider sx={{ mb: 4, borderColor: 'rgba(0, 0, 0, 0.12)', borderWidth: '1px' }} />
                                <Grid container spacing={4}>
                                    {officeBearers.map((member, index) => <MemberCard key={member.id} member={member} index={index} />)}
                                </Grid>
                            </Box>
                        )}

                        {generalMembers.length > 0 && (
                            <Box>
                                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ pl: 1 }}>सदस्य</Typography>
                                <Divider sx={{ mb: 4, borderColor: 'rgba(0, 0, 0, 0.12)', borderWidth: '1px' }} />
                                <Grid container spacing={4}>
                                    {generalMembers.map((member, index) => <MemberCard key={member.id} member={member} index={index} />)}
                                </Grid>
                            </Box>
                        )}

                        {members.length === 0 && (
                            <Typography sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
                                कोणतेही सदस्य सापडले नाहीत. कृपया admin panel मधून सदस्य जोडा.
                            </Typography>
                        )}
                    </>
                )}
            </Layout>
        </Box>
    );
};

export default GrampanchayatSadasya;