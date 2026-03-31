// import axios from 'axios';

// const xeroApi = axios.create({
//   baseURL: 'http://localhost:5081/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export const authService = {
//   signup: (userData) => xeroApi.post('/auth/signup', userData),
//  login: (credentials) => xeroApi.post('/auth/login', credentials),
//   getCompanies: (userId) => xeroApi.get(`/xero/companies/${userId}`),
//   connectXero: () => {
//     window.location.href = 'https://localhost:7273/xero/connect';
//   }
// };

// export default xeroApi;
import axios from "axios";

const xeroApi = axios.create({
  baseURL: "https://localhost:7273/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  login: (credentials) => xeroApi.post("/auth/login", credentials),
  getCompanies: (userId) => xeroApi.get(`/xero/companies/${userId}`),
 
  createCustomer: (data) => {
    return xeroApi.post(`/xero/create/customer/${data.userId}`, data);
},
  createProduct: (data) => xeroApi.post(`/xero/create/product/${data.userId}`, data),
  createInvoice: (data) => xeroApi.post(`/xero/create/invoice/${data.userId}`, data),

  getCustomers: (userId) => xeroApi.get(`/xero/customers/${userId}`),
  getProducts: (userId) => xeroApi.get(`/xero/products/${userId}`),
  getInvoices: (userId) => xeroApi.get(`/xero/invoices/${userId}`),

  
  connectXero: () => {
    window.location.href = "https://localhost:7273/xero/connect";
  },

  disconnectXero: (userId) => xeroApi.post(`/xero/disconnect/${userId}`),

};

export default xeroApi;
