import { useState, useRef } from 'react';
import { ThemeProvider, Box, CircularProgress, Button, Fab, Typography } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import theme from '../styles/theme.js';
import 'socket.io-client';

/* MAX ATTEMPTS TO TRY CONNECTING TO WEB SOCKET */
const MAX_RECONNECT = 5;
let reconnectAttempt = 0;

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

function Connection({ isActive, direction, goBack, performAnalysis, socket }) {
    const [status, setStatus] = useState("ti stiamo collegando al tuo streamer preferito");
    const [connection, setConnection] = useState(0);
    const activeRef = useRef(isActive);
    activeRef.current = isActive;

    /* Socket Connection Handlers */
    const connect = () => {
        setStatus("ti stiamo collegando al tuo streamer preferito");
        console.log("Trying to connect to the socket...");
        socket.connect();
        if (socket.connected) {
            console.log(`Socket ${socket.id} connected...`);
            setConnection(1);
            goForwardAnalysis();
        } else {
            console.log("Socket not connected on first attempt.");
            setConnection(2);
            retry();
        }
    }
    const retry = () => {
        reconnectAttempt += 1;
        console.log(`Retry attempt ${reconnectAttempt}...`);
        setTimeout(() => {
            if (activeRef.current) {
                console.log("Trying to reconnect...");
                socket.connect();
                if (socket.connected) {
                    console.log(`Socket ${socket.id} connected from retry...`);
                    setConnection(1);
                    goForwardAnalysis();
                } else {
                    console.log("Failed to connect from retry...");
                    if (reconnectAttempt < MAX_RECONNECT) retry();
                    else {
                        setConnection(0);
                        setStatus("failed to connect");
                    }
                }
            }
        }, 5000); // Increased timeout to 5 seconds
    }
    const disconnect = () => {
        if (socket.connected) {
            console.log(`Socket ${socket.id} disconnected...`);
            socket.disconnect();
        }
        setConnection(0);
    };
    const restartConnect = () => {
        setStatus("ti stiamo collegando al tuo streamer preferito");
        reconnectAttempt = 0;
        setConnection(2);
        connect();
    }

    /* Directional Render Loading Handlers */
    const goBackLanding = () => {
        setStatus("ti stiamo collegando al tuo streamer preferito");
        disconnect();
        reconnectAttempt = 0;
        goBack();
    };
    const goForwardAnalysis = () => performAnalysis(socket);

    if (direction === 'landing' && connection === 1) goBackLanding();
    if (isActive && direction === 'analyze' && connection !== 1 && connection !== 2 && reconnectAttempt < MAX_RECONNECT) connect();

    /* Render */
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
                        <Typography variant="h7" color="white">
                            <Box sx={{ letterSpacing: 3, pb: 2, pr: 3, pl: 3 }} maxWidth="50vh" textAlign="center">
                                {status}
                            </Box>
                        </Typography>
                        {connection === 1 ? (
                            <></>
                        ) : (
                            <Box sx={{ p: 3, pb: 10 }}>
                                {connection === 2 ? (
                                    <CircularProgress color="primary" />
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={restartConnect}
                                        startIcon={<ReplayIcon />}
                                    >
                                        Retry
                                    </Button>
                                )}
                            </Box>
                        )}
                        <Fab
                            size="medium"
                            color="primary"
                            aria-label="add"
                            onClick={goBackLanding}
                        >
                            <KeyboardReturnIcon />
                        </Fab>
                    </Box>
                </ThemeProvider>
            ) : (
                <></>
            )}
        </div>
    );
}

export default Connection;
