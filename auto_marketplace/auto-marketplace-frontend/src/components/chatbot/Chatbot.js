import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Zoom from '@mui/material/Zoom';
import axios from 'axios';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Bună ziua! Sunt George, asistentul tău virtual :). Cu ce te pot ajuta astăzi?' }
  ]);

  // Funcție pentru a crea un nou thread la prima interacțiune
  const createThread = async () => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/threads',
        {},
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );
      setThreadId(response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Eroare la crearea thread-ului:', error.response?.data || error.message);
      return null;
    }
  };

  // Funcție pentru a trimite un mesaj și primi răspuns
  const sendMessage = async (messageContent) => {
    // Dacă nu avem thread, îl creăm
    let currentThreadId = threadId || await createThread();
    
    if (!currentThreadId) {
      setChatHistory(prev => [...prev, { 
        sender: 'bot', 
        text: 'Îmi cer scuze, dar am întâmpinat o problemă tehnică.' 
      }]);
      return;
    }

    try {
      // Adăugăm mesajul utilizatorului în thread
      await axios.post(
        `https://api.openai.com/v1/threads/${currentThreadId}/messages`,
        {
          role: "user",
          content: messageContent
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );

      // Rulăm thread-ul cu asistentul
      const runResponse = await axios.post(
        `https://api.openai.com/v1/threads/${currentThreadId}/runs`,
        {
          assistant_id: "asst_YeoZ2FrlT9KPJ3zDXmEsvHJO"
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );

      // Verificăm statusul run-ului
      let runStatus;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Așteptăm 1 secundă între verificări
        
        const statusResponse = await axios.get(
          `https://api.openai.com/v1/threads/${currentThreadId}/runs/${runResponse.data.id}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
              'OpenAI-Beta': 'assistants=v2'
            }
          }
        );
        
        runStatus = statusResponse.data.status;
      } while (runStatus !== 'completed' && runStatus !== 'failed');

      // Preluăm mesajele
      const messagesResponse = await axios.get(
        `https://api.openai.com/v1/threads/${currentThreadId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );

      // Găsim ultimul mesaj de la asistent
      const assistantMessages = messagesResponse.data.data
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (assistantMessages.length > 0) {
        const lastAssistantMessage = assistantMessages[0].content[0].text.value;
        
        setChatHistory(prev => [...prev, { 
          sender: 'bot', 
          text: lastAssistantMessage 
        }]);
      }

    } catch (error) {
      console.error('Eroare la comunicarea cu George:', error.response?.data || error.message);
      setChatHistory(prev => [...prev, { 
        sender: 'bot', 
        text: 'Îmi cer scuze, dar am întâmpinat o problemă tehnică.' 
      }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Adăugăm mesajul utilizatorului în istoric
    setChatHistory(prev => [...prev, { sender: 'user', text: message }]);
    
    // Resetăm inputul și setăm starea de încărcare
    const currentMessage = message;
    setMessage('');
    setLoading(true);
    
    try {
      await sendMessage(currentMessage);
    } finally {
      // Resetăm starea de încărcare
      setLoading(false);
    }
  };

  // Restul componentei rămâne la fel
  const toggleChat = () => {
    setOpen(!open);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    // ... (codul HTML/JSX rămâne identic cu versiunea anterioară)
    <>
      <Fab
        color="primary"
        aria-label="chat"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={toggleChat}
      >
        <ChatIcon />
      </Fab>
      
      <Zoom in={open}>
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            width: 320,
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Typography variant="h6">George</Typography>
            <IconButton onClick={toggleChat} color="inherit" size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ 
            flexGrow: 1, 
            p: 2, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}>
            {chatHistory.map((chat, index) => (
              <Box 
                key={index}
                sx={{
                  alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start',
                  bgcolor: chat.sender === 'user' ? 'primary.light' : 'grey.200',
                  color: chat.sender === 'user' ? 'white' : 'text.primary',
                  p: 1.5,
                  borderRadius: 2,
                  maxWidth: '80%',
                }}
              >
                <Typography 
                  variant="body2" 
                  component="div" 
                  sx={{
                    whiteSpace: 'pre-wrap',
                    '& strong': {
                      fontWeight: 'bold',
                      color: 'inherit'
                    },
                    '& ol': {
                      paddingLeft: 2,
                      marginTop: 1,
                      marginBottom: 1
                    },
                    '& li': {
                      marginBottom: 0.5
                    }
                  }}
                  dangerouslySetInnerHTML={{
                    __html: chat.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold între ** **
                      .replace(/\n/g, '<br/>') // newline => <br/>
                      .replace(/(?:<br\s*\/?>)?(\d+)\.\s+(.*?)(?=(<br\s*\/?>\d+\.\s)|$)/gs, (match, num, content) => {
                        return `<li>${content.trim()}</li>`;
                      })
                      .replace(/(<li>.*?<\/li>)+/gs, (list) => `<ol>${list}</ol>`)
                  }}


                />
              </Box>
            ))}
            
            {loading && (
              <Box sx={{ 
                alignSelf: 'flex-start', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1 
              }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  George se gândește...
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Scrieți un mesaj..."
              variant="outlined"
              value={message}
              onChange={handleMessageChange}
              disabled={loading}
            />
            <IconButton 
              type="submit" 
              color="primary" 
              aria-label="send message" 
              disabled={!message.trim() || loading}
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Paper>
      </Zoom>
    </>
  );
};

export default Chatbot;