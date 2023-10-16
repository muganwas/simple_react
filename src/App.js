import { useEffect, useState } from 'react';
import { TextField, Checkbox, Button, Container, FormControlLabel, CircularProgress, Modal, Alert } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import './App.css';

const endPoint = 'http://13.231.17.170:8080';

function App() {
  const [data, setData] = useState([]);
  const [filledData, setFilledData] = useState({});
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState();
  useEffect(() => {
    fetchData();
  });
  const fetchData = async () => {
    const response = await fetch(endPoint + '/getTableFields?tablename=tbuser', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });
    const responseJson = await response.json();
    setData(responseJson.data);
  }
  const sendFilledData = async () => {
    let feedbackStr = '';
    const toSend = [];
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const Field = d["Field"];
      const Value = filledData[Field];
      toSend.push({ Field, Value });
      const canBNull = d["Null"] === "YES";
      if (!canBNull && !filledData[Field]) feedbackStr = feedbackStr + ' ' + Field + ', ';
    }
    if (feedbackStr) return setError(feedbackStr + "are required values.");
    setIsLoading(true);
    const response = await fetch('http://13.231.17.170:8080/test/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ "data": toSend }),
    });
    const responseJson = await response.json();
    setResponse(responseJson.metadata.msg);
    setIsLoading(false);
  }
  const renderForm = (data, i) => {
    const { Field, Type } = data;
    return (
      <div className='inputs' key={i}>
        {(Type === 'int' || Type.includes('varchar') || Type === 'tinytext') && <TextField onChange={(e) => setFilledData({ ...filledData, [Field]: e.target.value })} id={Field} className='input' label={Field} type='text' />}
        {Type === 'decimal' && <TextField onChange={(e) => setFilledData({ ...filledData, [Field]: e.target.value })} id={Field} className='input' label={Field} type='number' />}
        {Type === 'tinyint' && <FormControlLabel className='input' control={<Checkbox onChange={(e) => setFilledData({ ...filledData, [Field]: e.target.value === 'on' ? 1 : 0 })} id={Field} />} label={Field} />}
        {Type.includes('date') && <LocalizationProvider dateAdapter={AdapterDayjs}><DateTimePicker onChange={(e) => setFilledData({ ...filledData, [Field]: e })} id={Field} className='input' label={Field} /></LocalizationProvider>}
      </div>
    )
  }
  return (
    <main className="App">
      {!response && <Container className='inputs-container'>
        <Modal open={!!error} onClose={() => setError(null)}>
          <div className='error-container'><Alert severity='error'>{error}</Alert></div>
        </Modal>
        <Modal open={isLoading} onClose={() => setIsLoading(false)}>
          <div className='error-container'><CircularProgress color="secondary" /></div>
        </Modal>
        {data && data.map(renderForm)}
        <div className='button-container'>
          <Button onClick={sendFilledData} variant="outlined">Submit</Button>
        </div>
      </Container>}
      {response && <Container>
        {response}
      </Container>}
    </main>
  );
}

export default App;
