import React, { useState } from 'react';
import { financialAPI } from '../../services/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialCalculator = ({ price }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    price: price || 10000,
    down_payment: Math.round((price || 10000) * 0.2), // 20% avans implicit
    loan_term: 60, // 5 ani implicit
    interest_rate: 7.5, // 7.5% dobândă implicită
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validăm pentru a nu permite valori negative sau mai mari decât prețul (pentru avans)
    if (name === 'down_payment' && (value < 0 || value > formData.price)) {
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSliderChange = (name) => (event, newValue) => {
    setFormData({ ...formData, [name]: newValue });
  };
  
  const calculateLoan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await financialAPI.calculateLoan(formData);
      setResult(response.data);
    } catch (err) {
      console.error('Eroare la calculul împrumutului:', err);
      setError(err.response?.data?.error || 'A apărut o eroare la calcularea împrumutului.');
    } finally {
      setLoading(false);
    }
  };
  
  // Convertim rezultatele pentru grafic
  const prepareChartData = () => {
    if (!result || !result.payment_schedule) return [];
    
    return result.payment_schedule.map(item => ({
      month: item.month,
      payment: item.payment,
      principal: item.principal,
      interest: item.interest,
      remaining: item.remaining_balance,
    }));
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Calculator financiar
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Folosește calculatorul de mai jos pentru a estima rata lunară și costul total al finanțării pentru această mașină.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>
            Preț total: {formData.price.toLocaleString()} €
          </Typography>
          <Slider
            value={typeof formData.price === 'number' ? formData.price : 0}
            onChange={handleSliderChange('price')}
            aria-labelledby="price-slider"
            min={1000}
            max={200000}
            step={500}
            marks={[
              { value: 1000, label: '1.000 €' },
              { value: 50000, label: '50.000 €' },
              { value: 100000, label: '100.000 €' },
              { value: 200000, label: '200.000 €' },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value.toLocaleString()} €`}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Preț (€)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            inputProps={{ min: 1000 }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>
            Avans: {formData.down_payment.toLocaleString()} € ({Math.round((formData.down_payment / formData.price) * 100)}%)
          </Typography>
          <Slider
            value={typeof formData.down_payment === 'number' ? formData.down_payment : 0}
            onChange={handleSliderChange('down_payment')}
            aria-labelledby="down-payment-slider"
            min={0}
            max={formData.price}
            step={500}
            marks={[
              { value: 0, label: '0 €' },
              { value: formData.price * 0.25, label: '25%' },
              { value: formData.price * 0.5, label: '50%' },
              { value: formData.price, label: '100%' },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value.toLocaleString()} €`}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Avans (€)"
            name="down_payment"
            type="number"
            value={formData.down_payment}
            onChange={handleInputChange}
            inputProps={{ min: 0, max: formData.price }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>
            Durată împrumut: {formData.loan_term} luni ({Math.floor(formData.loan_term / 12)} ani și {formData.loan_term % 12} luni)
          </Typography>
          <Slider
            value={typeof formData.loan_term === 'number' ? formData.loan_term : 60}
            onChange={handleSliderChange('loan_term')}
            aria-labelledby="loan-term-slider"
            min={12}
            max={120}
            step={6}
            marks={[
              { value: 12, label: '1 an' },
              { value: 60, label: '5 ani' },
              { value: 84, label: '7 ani' },
              { value: 120, label: '10 ani' },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.floor(value / 12)} ani ${value % 12 > 0 ? ` ${value % 12} luni` : ''}`}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Durată (luni)"
            name="loan_term"
            type="number"
            value={formData.loan_term}
            onChange={handleInputChange}
            inputProps={{ min: 12, max: 120 }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>
            Rată dobândă anuală: {formData.interest_rate}%
          </Typography>
          <Slider
            value={typeof formData.interest_rate === 'number' ? formData.interest_rate : 7.5}
            onChange={handleSliderChange('interest_rate')}
            aria-labelledby="interest-rate-slider"
            min={1}
            max={20}
            step={0.1}
            marks={[
              { value: 1, label: '1%' },
              { value: 5, label: '5%' },
              { value: 10, label: '10%' },
              { value: 20, label: '20%' },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Dobândă (%)"
            name="interest_rate"
            type="number"
            value={formData.interest_rate}
            onChange={handleInputChange}
            inputProps={{ min: 1, max: 20, step: 0.1 }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={calculateLoan}
            disabled={loading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Calculează'}
          </Button>
        </Grid>
      </Grid>
      
      {result && (
        <Box sx={{ mt: 4 }}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Rezultate calculație
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Suma împrumutată:</Typography>
                <Typography variant="h5" color="primary.main" gutterBottom>
                  {result.loan_amount.toLocaleString()} €
                </Typography>
                
                <Typography variant="subtitle1">Rata lunară:</Typography>
                <Typography variant="h5" color="primary.main" gutterBottom>
                  {result.monthly_payment.toLocaleString()} €
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Total plătit:</Typography>
                <Typography variant="h5" gutterBottom>
                  {result.total_payment.toLocaleString()} €
                </Typography>
                
                <Typography variant="subtitle1">Total dobândă:</Typography>
                <Typography variant="h5" color="secondary.main" gutterBottom>
                  {result.total_interest.toLocaleString()} €
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Grafic evoluție împrumut */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Evoluție împrumut
            </Typography>
            
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart
                  data={prepareChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Luna', position: 'insideBottomRight', offset: -10 }}
                    allowDecimals={false}
                  />
                  <YAxis 
                    label={{ value: 'Euro (€)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()} €`]} 
                    labelFormatter={(value) => `Luna ${value}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="remaining" 
                    name="Sold rămas" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="principal" 
                    name="Principal" 
                    stroke={theme.palette.success.main} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="interest" 
                    name="Dobândă" 
                    stroke={theme.palette.secondary.main} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
          
          {/* Plan de plată */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Plan de plată
            </Typography>
            
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Luna</TableCell>
                    <TableCell align="right">Rata lunară</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Dobândă</TableCell>
                    <TableCell align="right">Sold rămas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.payment_schedule.map((row) => (
                    <TableRow
                      key={row.month}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                       <TableCell component="th" scope="row">
                        {row.month}
                      </TableCell>
                      <TableCell align="right">{row.payment.toLocaleString()} €</TableCell>
                      <TableCell align="right">{row.principal.toLocaleString()} €</TableCell>
                      <TableCell align="right">{row.interest.toLocaleString()} €</TableCell>
                      <TableCell align="right">{row.remaining_balance.toLocaleString()} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default FinancialCalculator;