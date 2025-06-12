import React, { useState } from 'react';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import Grid from '@mui/material/Grid';

const ImageGallery = ({ images }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep - 1 + maxSteps) % maxSteps);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
      {/* Imagine principală */}
      <Box
        sx={{
          height: 400,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          bgcolor: '#f5f5f5',
          cursor: 'pointer',
          '&:hover': {
            '& .zoom-icon': {
              opacity: 1,
            },
          },
        }}
        onClick={handleOpenDialog}
      >
        <img
          src={images[activeStep].original}
          alt={`Image ${activeStep + 1}`}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
        <Box
          className="zoom-icon"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '50%',
            padding: 1,
            opacity: 0,
            transition: 'opacity 0.3s',
          }}
        >
          <ZoomInIcon sx={{ color: 'white', fontSize: 32 }} />
        </Box>
      </Box>

      {/* Miniaturi */}
      <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
        {images.map((image, index) => (
          <Box
            key={index}
            sx={{
              height: 60,
              width: 80,
              m: 0.5,
              border: index === activeStep ? '2px solid #1976d2' : '2px solid transparent',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
            onClick={() => handleStepChange(index)}
          >
            <img
              src={image.thumbnail}
              alt={`Thumbnail ${index + 1}`}
              style={{
                height: '100%',
                width: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Stepper pentru navigare */}
      <MobileStepper
        variant="text"
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={images.length <= 1}
          >
            Următoarea
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button
            size="small"
            onClick={handleBack}
            disabled={images.length <= 1}
          >
            <KeyboardArrowLeft />
            Precedenta
          </Button>
        }
      />

      {/* Dialog pentru vizualizare fullscreen */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={images[activeStep].original}
              alt={`Full ${activeStep + 1}`}
              style={{
                maxHeight: '70vh',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
            <Grid container spacing={2} justifyContent="space-between" sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, px: 2 }}>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={handleBack}
                  disabled={images.length <= 1}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.5)', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' } }}
                >
                  <KeyboardArrowLeft />
                  Precedenta
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={images.length <= 1}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.5)', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' } }}
                >
                  Următoarea
                  <KeyboardArrowRight />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ImageGallery;