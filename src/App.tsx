import React from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import DynamicForm from './components/DynamicForm';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <DynamicForm />
      </Container>
    </ThemeProvider>
  );
}

export default App;
