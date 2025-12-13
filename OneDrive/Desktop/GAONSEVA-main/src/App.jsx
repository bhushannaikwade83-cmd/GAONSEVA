// src/App.jsx
import React, { createContext } from "react"; 
import { Routes, Route } from "react-router-dom";
import { Grid, Box, useMediaQuery, Typography } from "@mui/material"; 
import { useTheme } from "@mui/material/styles";
import TranslationManager from "./components/TranslationManager";

// Public Components
import Navbar from "./components/Navbar";
import Welcome from "./components/Welcome";
import Photosection from "./components/Photosection";
import RajyaGeetSection from "./components/RajyaGeetSection";
import MembersSection from "./components/MembersSection";
import GeneralMembersSection from "./components/GeneralMembersSection";
import GrampanchayatInfo from "./components/GrampanchayatInfo";
import DigitalSlogans from "./components/DigitalSlogans";
import GovLogosSection from "./components/GovLogosSection";
import Footer from "./components/Footer";
import GramSevakAI from "./components/GramSevakAI";

// Public Pages
import GrampanchayatMahiti from "./pages/GrampanchayatMahiti";
import GrampanchayatNaksha from "./pages/GrampanchayatNaksha";
import GrampanchayatSadasya from "./pages/GrampanchayatSadasya";
import GramsabhaNirnay from "./pages/GramsabhaNirnay";
import GramPuraskar from "./pages/GramPuraskar";
import Festival from "./pages/Festival";
import GramSuvidha from "./pages/GramSuvidha";
import Gramparyatansthale from "./pages/Gramparyatansthale";
import Gramjanganna from "./pages/Gramjanganna";
import GramDhurdhvani from "./pages/GramDhurdhvani";
import GramHelpline from "./pages/GramHelpline";
import GramRugnalay from "./pages/GramRugnalay";
import GramEseva from "./pages/GramEseva";
import TakrarNondani from "./pages/TakrarNondani";
import SwachhGav from "./pages/SwachhGav";
import Vikeltepikel from "./pages/Vikeltepikel";
import Grammajhikutumb from "./pages/Grammajhikutumb";
import GramTantamuktGav from "./pages/GramTantamuktGav";
import GramJalyuktShivar from "./pages/GramJalyuktShivar";
import GramTushargav from "./pages/GramTushargav";
import GramRotiPurakVyavsay from "./pages/GramRotiPurakVyavsay";
import GramGavadoli from "./pages/GramGavadoli";
import GramMatdarNondani from "./pages/GramMatdarNondani";
import GramSarvaShikshaAbhiyan from "./pages/GramSarvaShikshaAbhiyan";
import GramKridaSpardha from "./pages/GramKridaSpardha";
import GramArogyaShibir from "./pages/GramArogyaShibir";
import GramKachraNivaran from "./pages/GramKachraNivaran";
import GramBiogasNirmiti from "./pages/GramBiogasNirmiti";
import GramSendriyaKhat from "./pages/GramSendriyaKhat";
import GramRajyaSarkarYojna from "./pages/GramRajyaSarkarYojna";
import GramKendraSarkarYojana from "./pages/GramKendraSarkarYojana";
import PragatShetkari from "./pages/PragatShetkari";
import EShikshan from "./pages/EShikshan";
import Batmya from "./pages/Batmya";
import Sampark from "./pages/Sampark";
import ArthsankalpParadarkshita from "./pages/ArthsankalpParadarkshita";

// Admin Components
import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";
import AdminLayout from "./admin/AdminLayout";
import GramPanchayatProfile from "./admin/Gram-panchayat-profile";
import ProtectedRoute from "./admin/ProtectedRoute";

// Admin Pages (Management sections)
import ManageInfo from "./admin/pages/manage-gram-panchayat/ManageInfo";
import ManageMap from "./admin/pages/manage-gram-panchayat/ManageMap";
import ManageMembers from "./admin/pages/manage-gram-panchayat/ManageMembers";
import ManageDecisions from "./admin/pages/manage-gram-panchayat/ManageDecisions";
import ManageAwards from "./admin/pages/manage-gram-panchayat/ManageAwards";
import ManageFestivals from "./admin/pages/manage-gram-panchayat/ManageFestivals";
import ManageFacilities from "./admin/pages/manage-gram-panchayat/ManageFacilities";
import ManageESeva from "./admin/pages/manage-gram-panchayat/ManageESeva";
import ManageTourism from "./admin/pages/manage-gram-panchayat/ManageTourism";
import ManageComplaints from "./admin/pages/manage-gram-panchayat/ManageComplaints";

// Admin Pages: निर्देशिका
import Janaganana from "./admin/pages/manage-nirdeshika/Janaganana";
import Contacts from "./admin/pages/manage-nirdeshika/Contacts";
import Helpline from "./admin/pages/manage-nirdeshika/Helpline";
import Hospitals from "./admin/pages/manage-nirdeshika/Hospitals";

// Admin Pages: Program Management
import ManageSvachhGaav from "./admin/pages/program/ManageSvachhGaav";
import ManageVikelTePikel from "./admin/pages/program/ManageVikelTePikel";
import ManageMaajheKutumb from "./admin/pages/program/ManageMaajheKutumb";
import ManageTantamuktGaav from "./admin/pages/program/ManageTantamuktGaav";
import ManageJalyuktShivar from "./admin/pages/program/ManageJalyuktShivar";
import ManageTushargaavad from "./admin/pages/program/ManageTushargaavad";
import ManageRotiPoorak from "./admin/pages/program/ManageRotiPoorak";
import ManageGadoli from "./admin/pages/program/ManageGadoli";
import ManageMatdaarNondani from "./admin/pages/program/ManageMatdaarNondani";
import ManageSarvaShiksha from "./admin/pages/program/ManageSarvaShiksha";
import ManageKreedaSpardha from "./admin/pages/program/ManageKreedaSpardha";
import ManageAarogyaShibir from "./admin/pages/program/ManageAarogyaShibir";
import ManageKachryacheNiyojan from "./admin/pages/program/ManageKachryacheNiyojan";
import ManageBiogasNirmiti from "./admin/pages/program/ManageBiogasNirmiti";
import ManageSendriyaKhat from "./admin/pages/program/ManageSendriyaKhat";
import ManageStateYojana from "./admin/pages/yojana/ManageStateYojana";
import ManageCentralYojana from "./admin/pages/yojana/ManageCentralYojana";
import ManagePragatShetkari from "./admin/pages/extra/ManagePragatShetkari";
import ManageEShikshan from "./admin/pages/extra/ManageEShikshan";
import ManageBatmya from "./admin/pages/extra/ManageBatmya";
import ManageSampark from "./admin/pages/extra/ManageSampark";

// Admin Pages: Home management
import ManageHomeNavbar from "./admin/pages/home/ManageHomeNavbar";
import ManageHomeWelcome from "./admin/pages/home/ManageHomeWelcome";
import ManageHomePhotos from "./admin/pages/home/ManageHomePhotos";
import ManageHomeRajyaGeet from "./admin/pages/home/ManageHomeRajyaGeet";
import ManageHomeMessages from "./admin/pages/home/ManageHomeMessages";
import ManageHomeMembers from "./admin/pages/home/ManageHomeMembers";
import ManageHomeInfo from "./admin/pages/home/ManageHomeInfo";
import ManageHomeDigitalSlogans from "./admin/pages/home/ManageHomeDigitalSlogans";
import ManageHomeGovLogos from "./admin/pages/home/ManageHomeGovLogos";
import ManageHomeFooter from "./admin/pages/home/ManageHomeFooter";
import ManageBudget from "./admin/pages/manage-gram-panchayat/ManageBudget";

// Tenant Context
// We keep this so child components that use useContext(TenantContext) don't break
export const TenantContext = createContext({ name: "Default Gram Panchayat" });

// This component wraps all the public-facing pages
const MainLayout = ({ isMobile, navbarHeight, tenant }) => (
  <TenantContext.Provider value={tenant}>
    <TranslationManager />
    <Navbar />
    <Box>
      <Routes>
        {/* Home Page Route */}
        <Route
          path="/"
          element={
            <>
              <Welcome tenant={tenant} />
              <Photosection />
              <Box>
                <RajyaGeetSection />
                <Grid container spacing={isMobile ? 2 : 4} sx={{ width: "100%", m: 0, p: 0 }}>
                  <Grid item xs={12} md={12} lg={12} sx={{ pr: { lg: 8 } }}><MembersSection /></Grid>
                </Grid>
                <GeneralMembersSection />
                <GrampanchayatInfo />
                <DigitalSlogans />
                <GovLogosSection />
              </Box>
            </>
          }
        />
        
        {/* Routes for all public pages */}
        <Route path="/ग्रामपंचायत-माहिती" element={<GrampanchayatMahiti />} />
        <Route path="/ग्रामपंचायत-नकाशा" element={<GrampanchayatNaksha />} />
        <Route path="/ग्रामपंचायत-सदस्य" element={<GrampanchayatSadasya />} />
        <Route path="/ग्रामपंचायत-ग्रामसभेचे-निर्णय" element={<GramsabhaNirnay />} />
        <Route path="/ग्रामपंचायत-पुरस्कार" element={<GramPuraskar />} />
        <Route path="/ग्रामपंचायत-सण-उत्सव" element={<Festival />} />
        <Route path="/ग्रामपंचायत-सुविधा" element={<GramSuvidha />} />
        <Route path="/ग्रामपंचायत-ई-सेवा" element={<GramEseva />} />
        <Route path="/ग्रामपंचायत-पर्यटन-सथळे" element={<Gramparyatansthale />} />
        <Route path="/निर्देशिका-जनगणना" element={<Gramjanganna />} />
        <Route path="/निर्देशिका-दूरध्वनी-क्रमांक" element={<GramDhurdhvani />} />
        <Route path="/निर्देशिका-हेल्पलाईन" element={<GramHelpline />} />
        <Route path="/निर्देशिका-रुग्णालय" element={<GramRugnalay />} />
        <Route path="/उपक्रम-स्वच्छ-गाव" element={<SwachhGav />} />
        <Route path="/उपक्रम-विकेल-ते-पिकेल" element={<Vikeltepikel />} />
        <Route path="/उपक्रम-माझे-कुटुंब-माझी-जबाबदारी" element={<Grammajhikutumb />} />
        <Route path="/उपक्रम-तंटामुक्त-गाव" element={<GramTantamuktGav />} />
        <Route path="/उपक्रम-जलयुक्त-शिवार" element={<GramJalyuktShivar />} />
        <Route path="/उपक्रम-तुषारगावड" element={<GramTushargav />} />
        <Route path="/उपक्रम-रोती-पूरक-व्यवसाय" element={<GramRotiPurakVyavsay />} />
        <Route path="/उपक्रम-गादोली" element={<GramGavadoli />} />
        <Route path="/उपक्रम-मतदार-नोंदणी" element={<GramMatdarNondani />} />
        <Route path="/उपक्रम-सर्व-शिक्षा-अभियान" element={<GramSarvaShikshaAbhiyan />} />
        <Route path="/उपक्रम-क्रीडा-स्पर्धा" element={<GramKridaSpardha />} />
        <Route path="/उपक्रम-आरोग्य-शिबिर" element={<GramArogyaShibir />} />
        <Route path="/उपक्रम-कचऱ्याचे-नियोजन" element={<GramKachraNivaran />} />
        <Route path="/उपक्रम-बायोगॅस-निर्मिती" element={<GramBiogasNirmiti />} />
        <Route path="/उपक्रम-सेंद्रिय-खत-निर्मिती" element={<GramSendriyaKhat />} />
        <Route path="/योजना-राज्य-सरकार-योजना" element={<GramRajyaSarkarYojna />} />
        <Route path="/योजना-केंद्र-सरकार-योजना" element={<GramKendraSarkarYojana />} />
        <Route path="/तक्रार-नोंदणी" element={<TakrarNondani />} />
        <Route path="/अर्थसंकल्प-पारदर्शकता" element={<ArthsankalpParadarkshita />} />
        <Route path="/pragat-shetkari" element={<PragatShetkari />} />
        <Route path="/e-shikshan" element={<EShikshan />} />
        <Route path="/batmya" element={<Batmya />} />
        <Route path="/sampark" element={<Sampark />} />
      </Routes>
    </Box>
    <Footer />
    <GramSevakAI />
  </TenantContext.Provider>
);

// Main App Component
function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navbarHeight = 64;

  // Static Tenant Data (To fix the blank screen)
  const tenant = {
    name: "Gram Panchayat",
    id: "default"
  };

  return (
    <Routes>
      {/* Admin Section Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminPanel />} />
        <Route path="panel" element={<AdminPanel />} />
        <Route path="profile" element={<GramPanchayatProfile />} />
        
        {/* Management pages */}
        <Route path="manage/info" element={<ManageInfo />} />
        <Route path="manage/map" element={<ManageMap />} />
        <Route path="manage/members" element={<ManageMembers />} />
        <Route path="manage/decisions" element={<ManageDecisions />} />
        <Route path="manage/awards" element={<ManageAwards />} />
        <Route path="manage/festivals" element={<ManageFestivals />} />
        <Route path="manage/facilities" element={<ManageFacilities />} />
        <Route path="manage/eseva" element={<ManageESeva />} />
        <Route path="manage/tourism" element={<ManageTourism />} />
        <Route path="manage/complaints" element={<ManageComplaints />} />
        <Route path="budget" element={<ManageBudget />} />

        {/* Home management */}
        <Route path="home/navbar" element={<ManageHomeNavbar />} />
        <Route path="home/welcome" element={<ManageHomeWelcome />} />
        <Route path="home/photos" element={<ManageHomePhotos />} />
        <Route path="home/rajya-geet" element={<ManageHomeRajyaGeet />} />
        <Route path="home/messages" element={<ManageHomeMessages />} />
        <Route path="home/members" element={<ManageHomeMembers />} />
        <Route path="home/info" element={<ManageHomeInfo />} />
        <Route path="home/digital-slogans" element={<ManageHomeDigitalSlogans />} />
        <Route path="home/gov-logos" element={<ManageHomeGovLogos />} />
        <Route path="home/footer" element={<ManageHomeFooter />} />

        {/* Directory (Nirdeshika) */}
        <Route path="manage-nirdeshika/janaganana" element={<Janaganana />} />
        <Route path="manage-nirdeshika/contacts" element={<Contacts />} />
        <Route path="manage-nirdeshika/helpline" element={<Helpline />} />
        <Route path="manage-nirdeshika/hospitals" element={<Hospitals />} />

        {/* Programs */}
        <Route path="program/svachh-gaav" element={<ManageSvachhGaav />} />
        <Route path="program/vikel-te-pikel" element={<ManageVikelTePikel />} />
        <Route path="program/maajhe-kutumb" element={<ManageMaajheKutumb />} />
        <Route path="program/tantamukt-gaav" element={<ManageTantamuktGaav />} />
        <Route path="program/jalyukt-shivar" element={<ManageJalyuktShivar />} />
        <Route path="program/tushargaavad" element={<ManageTushargaavad />} />
        <Route path="program/roti-poorak" element={<ManageRotiPoorak />} />
        <Route path="program/gadoli" element={<ManageGadoli />} />
        <Route path="program/matdaar-nondani" element={<ManageMatdaarNondani />} />
        <Route path="program/sarva-shiksha" element={<ManageSarvaShiksha />} />
        <Route path="program/kreeda-spardha" element={<ManageKreedaSpardha />} />
        <Route path="program/aarogya-shibir" element={<ManageAarogyaShibir />} />
        <Route path="program/kachryache-niyojan" element={<ManageKachryacheNiyojan />} />
        <Route path="program/biogas-nirmiti" element={<ManageBiogasNirmiti />} />
        <Route path="program/sendriya-khat" element={<ManageSendriyaKhat />} />
        
        {/* Schemes */}
        <Route path="yojana/state" element={<ManageStateYojana />} />
        <Route path="yojana/central" element={<ManageCentralYojana />} />
        
        {/* Extra */}
        <Route path="extra/pragat-shetkari" element={<ManagePragatShetkari />} />
        <Route path="extra/e-shikshan" element={<ManageEShikshan />} />
        <Route path="extra/batmya" element={<ManageBatmya />} />
        <Route path="extra/sampark" element={<ManageSampark />} />
      </Route>

      {/* Main Public Website Routes */}
      <Route 
        path="/*" 
        element={
          <MainLayout 
            isMobile={isMobile} 
            navbarHeight={navbarHeight} 
            tenant={tenant} 
          />
        } 
      />
    </Routes>
  );
}

export default App;