// @ts-ignore
const express = require('express');
// @ts-ignore
const { PrismaClient } = require('@prisma/client');
// @ts-ignore
const ApiEz = require('../lib/main.ts');

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

const port = 3001;
const apiEz = new ApiEz(prisma, app);
apiEz.init();

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
