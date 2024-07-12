import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ThemeProvider, Box, Typography, Fab } from '@mui/material';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import theme from '../styles/theme';

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

function Analysis({ isActive, streamer, socket, goBack }) {
    const [chat, setChat] = useState([]);
    const [twitch, setTwitch] = useState(false);
    const [sentimentScore, setSentimentScore] = useState(50);
    const [userMessages, setUserMessages] = useState({});
    const [positiveComments, setPositiveComments] = useState({});
    const [negativeComments, setNegativeComments] = useState({});
    const [autoScroll, setAutoScroll] = useState(true);

    const chatRef = useRef(null);

    useEffect(() => {
        if (isActive && !twitch) {
            socket.emit("start", streamer);
            setTwitch(true);
        }

        const handleNewMessage = (data) => {
            if (data.user.toLowerCase().includes('bot') || data.user.toLowerCase() === 'streamelements') return;

            let newChat = [...chat, { user: data.user, msg: data.msg, id: chat.length, sentiment: data.sentiment }];
            if (newChat.length > 500) {
                newChat.shift();
            }

            setChat(newChat);
            setSentimentScore((prevScore) => {
                let newScore = prevScore + (data.sentiment === 1 ? 1 : -1);
                return Math.max(0, Math.min(100, newScore));
            });

            setUserMessages((prevUserMessages) => {
                const newUserMessages = { ...prevUserMessages };
                if (newUserMessages[data.user]) {
                    newUserMessages[data.user] += 1;
                } else {
                    newUserMessages[data.user] = 1;
                }
                return newUserMessages;
            });

            if (data.sentiment === 1) {
                setPositiveComments((prevPositiveComments) => {
                    const newPositiveComments = { ...prevPositiveComments };
                    if (newPositiveComments[data.user]) {
                        newPositiveComments[data.user] += 1;
                    } else {
                        newPositiveComments[data.user] = 1;
                    }
                    return newPositiveComments;
                });
            } else {
                setNegativeComments((prevNegativeComments) => {
                    const newNegativeComments = { ...prevNegativeComments };
                    if (newNegativeComments[data.user]) {
                        newNegativeComments[data.user] += 1;
                    } else {
                        newNegativeComments[data.user] = 1;
                    }
                    return newNegativeComments;
                });
            }
        };

        socket.on("new_msg", handleNewMessage);

        return () => {
            socket.off("new_msg", handleNewMessage);
        };
    }, [socket, chat, isActive, streamer, twitch]);

    useEffect(() => {
        if (autoScroll && chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [chat, autoScroll]);

    const handleScroll = useCallback(() => {
        const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
        if (scrollTop + clientHeight < scrollHeight - 10) {
            setAutoScroll(false);
        } else {
            setAutoScroll(true);
        }
    }, []);

    const backToLanding = () => {
        setTwitch(false);
        setChat([]);
        setSentimentScore(50);
        setUserMessages({});
        setPositiveComments({});
        setNegativeComments({});
        goBack();
    }

    const embedLink = `http://127.0.0.1:5002/video_feed?channel=${streamer}`;

    const topUsers = Object.entries(userMessages)
        .filter(([user]) => !user.toLowerCase().includes('bot') && user.toLowerCase() !== 'streamelements')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const topPositiveUsers = Object.entries(positiveComments)
        .filter(([user]) => !user.toLowerCase().includes('bot') && user.toLowerCase() !== 'streamelements')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const topNegativeUsers = Object.entries(negativeComments)
        .filter(([user]) => !user.toLowerCase().includes('bot') && user.toLowerCase() !== 'streamelements')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const getBarColor = (score) => {
        if (score >= 50) {
            const greenIntensity = Math.round((score - 50) * 5.1);
            return `rgb(0, ${greenIntensity}, 0)`;
        } else {
            const redIntensity = Math.round((50 - score) * 5.1);
            return `rgb(${redIntensity}, 0, 0)`;
        }
    };

    const getChatState = (score) => {
        if (score <= 30) return { text: "CHAT NEGATIVA", color: 'darkred' };
        if (score <= 60) return { text: "CHAT NEUTRA", color: 'orange' };
        return { text: "CHAT POSITIVA", color: 'green' };
    };

    const chatState = getChatState(sentimentScore);

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <style>
                {gradientAnimation}
                {floatingAnimation}
                {`
                    body {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                `}
            </style>
            {isActive ? (
                <ThemeProvider theme={theme}>
                    <Box minHeight="98vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={backgroundStyle}>
                        <Box sx={{ ...floatingElements, top: '10%', left: '10%' }} />
                        <Box sx={{ ...floatingElements2, top: '70%', left: '80%' }} />
                        <Box sx={{ ...floatingElements, top: '30%', right: '10%' }} />
                        <Box sx={{ ...floatingElements2, bottom: '20%', left: '20%' }} />
                        <Typography variant="h4" color="white" sx={{ mb: 1, mt: 2 }}>
                            Streamer: {streamer.charAt(0).toUpperCase() + streamer.slice(1)}
                        </Typography>
                        <Box sx={{ display: 'flex', width: '90%', justifyContent: 'space-between', height: '70vh' }}>
                            <Box sx={{ border: '5px solid orange', borderRadius: '10px', p: 1, backgroundColor: 'black', width: '65%', height: '100%' }}>
                                <img src={embedLink} height="100%" width="100%" title="Twitch" style={{ border: 0, borderRadius: '10px' }} alt="Emotion Analyzed Stream" />
                            </Box>
                            <Box sx={{ border: '5px solid orange', borderRadius: '10px', p: 1, backgroundColor: 'black', width: '30%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Typography variant="h6" color="orange" align="center" sx={{ mb: 1 }}>
                                    LIVE CHAT
                                </Typography>
                                <Box ref={chatRef} onScroll={handleScroll} style={{ overflowY: 'scroll', flexGrow: 1, mt: 2 }} sx={{ p: 1 }}>
                                    <ul style={{ listStyleType: "none", padding: 2, whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
                                        {chat.map((item, index) => (
                                            <li style={{
                                                textAlign: "left",
                                                color: item.sentiment === 1 ? "#00ff00" : "#ff0000",
                                                backgroundColor: "#1e1e1e",
                                                whiteSpace: "pre-wrap",
                                                padding: 10,
                                                margin: 4,
                                                borderRadius: 10,
                                                fontSize: "2vh",
                                                fontFamily: "Arial, sans-serif",
                                                fontWeight: "bold",
                                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
                                            }} key={index}>
                                                <span style={{ color: "#ffffff" }}>{item.user}</span>: {item.msg}
                                            </li>
                                        ))}
                                    </ul>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, width: '50%' }}>
                            <Box width="100%" height={15} bgcolor="gray" borderRadius={10} position="relative" mb={1} sx={{ mt: 2 }}>
                                <Box width={`${sentimentScore}%`} height="100%" bgcolor={getBarColor(sentimentScore)} borderRadius={10} position="absolute" />
                                <Box width={20} height={20} bgcolor="black" borderRadius="50%" position="absolute" top={-5} left={`calc(${sentimentScore}% - 10px)`} boxShadow="0px 4px 6px rgba(0, 0, 0, 0.3)" />
                            </Box>
                            <Box sx={{ backgroundColor: chatState.color, borderRadius: 2, p: 0.5, px: 1 }}>
                                <Typography variant="body2" color="white" align="center">
                                    {sentimentScore}% {chatState.text}
                                </Typography>
                            </Box>
                        </Box>
                        <Box width="90%" sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
                            <Box sx={{ width: '32%', p: 2, backgroundColor: 'black', border: '2px solid orange', borderRadius: 2, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', textAlign: 'center', color: 'white' }}>
                                <Typography variant="h6" color="orange">
                                    TOP 3 USERS
                                </Typography>
                                {topUsers.map(([user, count]) => (
                                    <Typography key={user} variant="body1">
                                        <span style={{ color: '#00BFFF' }}>{user}</span>: {count} messages
                                    </Typography>
                                ))}
                            </Box>
                            <Box sx={{ width: '32%', p: 2, backgroundColor: 'black', border: '2px solid orange', borderRadius: 2, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', textAlign: 'center', color: 'white' }}>
                                <Typography variant="h6" color="orange">
                                    TOP 3 POSITIVE USERS
                                </Typography>
                                {topPositiveUsers.map(([user, count]) => (
                                    <Typography key={user} variant="body1">
                                        <span style={{ color: '#00FF00' }}>{user}</span>: {count} positive comments
                                    </Typography>
                                ))}
                            </Box>
                            <Box sx={{ width: '32%', p: 2, backgroundColor: 'black', border: '2px solid orange', borderRadius: 2, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', textAlign: 'center', color: 'white' }}>
                                <Typography variant="h6" color="orange">
                                    TOP 3 NEGATIVE USERS
                                </Typography>
                                {topNegativeUsers.map(([user, count]) => (
                                    <Typography key={user} variant="body1">
                                        <span style={{ color: '#FF6347' }}>{user}</span>: {count} negative comments
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                        <Fab size="medium" color="primary" aria-label="add" onClick={backToLanding} sx={{ mt: 3 }}>
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

export default Analysis;
