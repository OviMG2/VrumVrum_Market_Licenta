import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';

const LoadingScreen = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  
  
  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prevProgress + 10; 
        });
      }, 50); 
      
      return () => {
        clearInterval(timer);
      };
    } else {
      setProgress(0);
    }
  }, [isLoading]);
  
  if (!isLoading) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '320px',
          height: '100px', 
          mb: 2,
        }}
      >
     
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            bottom: '20px', 
            width: '100%',
            height: '20px', 
            bgcolor: '#444', 
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.3)',
          }}
        >
       
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: '45%',
              width: '100%',
              height: '10%',
              bgcolor: '#f5f5f5', 
            }}
          />
          
     
          {Array.from({ length: 12 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                left: `${i * 8.33 + 2}%`,
                top: '45%',
                width: '5%',
                height: '10%',
                bgcolor: '#f5f5f5', 
              }}
            />
          ))}
        </Box>
        
        {/* Bara de progres - sub șosea, pentru a arăta cât a parcurs mașina */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            bottom: '5px',
            width: '100%',
            height: '8px',
            bgcolor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${progress}%`,
              bgcolor: 'primary.main',
              borderRadius: '4px',
              transition: 'width 0.12s ease-out',
            }}
          />
        </Box>
        
        {/* Mașina de curse pe șosea */}
        <Box
          sx={{
            position: 'absolute',
            left: `calc(${Math.min(progress, 77)}% - 25px)`, // Limitat la 95% pentru a nu ieși complet
            bottom: '23px', // Poziționată exact deasupra șoselei
            transition: 'left 0.12s ease-out',
            zIndex: 2,
            transform: 'scaleX(-1)', // Inversează direcția pentru a indica mișcarea spre dreapta
            animation: 'carBounce 0.2s infinite alternate',
            '@keyframes carBounce': {
              '0%': { bottom: '23px' },
              '100%': { bottom: '24px' }
            }
          }}
        >
          {/* Emoji-ul mașină de curse 🏎️ */}
          <div style={{ 
            fontSize: '84px', // Dimensiune mărită
            filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.3))',
            position: 'relative',
            lineHeight: 1
          }}>
            🏎️
          </div>
          
        </Box>
      </Box>
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SpeedIcon color="primary" sx={{ mr: 1, animation: 'pulse 1s infinite' }} />
        <Typography variant="body1" color="primary" fontWeight="bold">
          Se încarcă... {Math.round(progress)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
