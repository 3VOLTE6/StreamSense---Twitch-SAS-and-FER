import { useState } from 'react';
import { TextField, Typography, ThemeProvider, Box } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowOutwardSharpIcon from '@mui/icons-material/ArrowOutwardSharp';
import theme from '../styles/theme.js';
import checkLive from '../functions/checkLive.js';
import logo from '../streamsense-logo.jpg'; // Percorso corretto del logo

const backgroundStyle = {
  background: "linear-gradient(135deg, rgba(91, 34, 130, 1) 0%, rgba(122, 45, 160, 1) 25%, rgba(147, 58, 185, 1) 50%, rgba(122, 45, 160, 1) 75%, rgba(91, 34, 130, 1) 100%)",
  backgroundSize: "400% 400%",
  animation: "gradient 15s ease infinite",
  position: "relative",
  overflow: "hidden"
};

const gradientAnimation = `
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

const floatingElements = {
  content: '""',
  position: 'absolute',
  width: '200px',
  height: '200px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '50%',
  animation: 'float 6s ease-in-out infinite',
  opacity: 0.5,
};

const floatingElements2 = {
  ...floatingElements,
  width: '300px',
  height: '300px',
  animationDuration: '8s'
};

const floatingAnimation = `
@keyframes float {
  0% { transform: translate(0, 0); }
  50% { transform: translate(20px, 20px); }
  100% { transform: translate(0, 0); }
}
`;

const buttonStyle = {
  backgroundColor: '#00FAFA',
  color: 'black',
  '&:hover': {
    backgroundColor: '#00DDDD'
  },
  '&:active': {
    backgroundColor: '#00DDDD',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(2px)'
  },
  '& .MuiLoadingButton-startIcon': {
    color: 'black'
  }
};

function Landing({ isActive, performAnalysis }) {
  const [streamer, setStreamer] = useState("");
  const [loading, setLoading] = useState(false);
  const [validate, setValidate] = useState(true);
  const [errorStr, setErrorStr] = useState("");

  const analyze = () => {
    setLoading(true);

    // Empty input
    if (streamer === "") {
      setValidate(false);
      setErrorStr("Streamer");
      setLoading(false);
      return;
    }

    // Check if streamer is live
    (async () => {
      let isLive = await checkLive(streamer);
      console.log(`isLive: ${isLive}`);
      if (isLive !== 1) {
        if (isLive === 0) setErrorStr(`${streamer} non è in diretta`);
        else if (isLive === 2) setErrorStr(`Per favore riprova`);
        else setErrorStr(`Utente non esiste`);
        setValidate(false);
        setLoading(false);
      } else {
        setValidate(true);
        setErrorStr("");
        performAnalysis(streamer);
        setStreamer("");
        setLoading(false);
      }
    })();
  };

  return (
    <div>
      <style>
        {gradientAnimation}
        {floatingAnimation}
      </style>
      {isActive ? (
        <ThemeProvider theme={theme}>
          <Box
            minHeight="98vh"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={backgroundStyle}
          >
            <Box sx={{ ...floatingElements, top: '10%', left: '10%' }} />
            <Box sx={{ ...floatingElements2, top: '70%', left: '80%' }} />
            <Box sx={{ ...floatingElements, top: '30%', right: '10%' }} />
            <Box sx={{ ...floatingElements2, bottom: '20%', left: '20%' }} />
            <Box
              component="img"
              src={logo}
              alt="StreamSense Logo"
              sx={{ width: 150, height: 150, mb: 3, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)', borderRadius: '20%' }}
            />
            <Typography variant="h2" color="white" sx={{ mb: 2 }}>
              StreamSense
            </Typography>
            <Typography variant="h6" color="white" sx={{ mb: 3 }}>
              Analizza l'umore della chat del tuo streamer Twitch preferito in tempo reale
            </Typography>
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems="center"
              justifyContent="center"
              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', p: 3, borderRadius: 3, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)' }}
            >
              <Box sx={{ pr: { sm: 3 }, pb: { xs: 3, sm: 0 } }}>
                <TextField
                  sx={{ width: { xs: 200, md: 350 } }}
                  error={!validate}
                  label={errorStr || "Streamer"}
                  variant="outlined"
                  onKeyDown={(e) => { if (e.key === 'Enter') analyze(); }}
                  type="text"
                  placeholder="Streamer"
                  value={streamer}
                  onChange={(e) => setStreamer(e.target.value)}
                  InputProps={{
                    style: { color: 'white' }
                  }}
                  InputLabelProps={{
                    style: { color: 'white' }
                  }}
                />
              </Box>
              <Box>
                <LoadingButton
                  sx={buttonStyle}
                  onClick={analyze}
                  loading={loading}
                  loadingPosition="start"
                  startIcon={<ArrowOutwardSharpIcon />}
                  variant="contained"
                  size="large"
                >
                  <span>Analyze</span>
                </LoadingButton>
              </Box>
            </Box>
          </Box>
        </ThemeProvider>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Landing;
