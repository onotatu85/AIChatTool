import axios from 'axios';

const client = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
