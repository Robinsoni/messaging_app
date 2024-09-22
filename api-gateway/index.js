import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { configDotenv } from 'dotenv';

configDotenv();
const PORT = process.env.PORT;
const app = express();

const routes = {
    "/api/auth": "http://localhost:5000/auth",
    "/api/users": "http://localhost:5000/users",
    "/api/msgs": "http://localhost:8000/msgs"
}

for (const route in routes) {
    const target = routes[route];
    app.use(route, createProxyMiddleware({ target, changeOrigin: true }));
}


app.listen(PORT, () => { 
    console.log(`Server is listening at http://localhost:${PORT}`);
});

