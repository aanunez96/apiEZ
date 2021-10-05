const express = require('express');
// @ts-ignore
const { PrismaClient } = require('@prisma/client');
const Apiez = require('./lib/main.ts');

const prisma = new PrismaClient();

const app = express();
const port = 3001;
const apies = new Apiez(prisma, express);
apies.init();

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
