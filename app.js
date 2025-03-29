const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('TP02 - Jenkins - CI/CD - DevOps - 2025');
});

app.get('/TP02', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}