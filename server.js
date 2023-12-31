const express = require('express');
const http = require('http');
//const WebSocket = require('ws');
const mysql = require('mysql2'); // Para la conexión a la base de datos
const path = require('path');
const { clearInterval } = require('timers');

const app = express();
const server = http.createServer(app);
//const wss = new WebSocket.Server({ server });

// Configura tu base de datos
const conexionDB = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'ubicaciones',
});

// Conecta a la base de datos
conexionDB.connect((error) => {
  if (error) {
    console.error('Error al conectar a la base de datos:', error);
    return;
  }
  console.log('Conexión a la base de datos exitosa.');
});

// Ruta para servir la página HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Ruta para obtener coordenadas desde la base de datos 
app.get('/coordenadas', (req, res) => {
  conexionDB.query('SELECT remitente, mensaje FROM mensajes ORDER BY id DESC LIMIT 1', (error, resultados) => {
    if (error) {
      console.error('Error al obtener datos:', error);
      res.status(500).send('Error al obtener datos');
      return;
    }
    if (resultados.length > 0) {
      res.json(resultados[0]);
    } else {
      res.status(404).send('No se encontraron datos');
    }
  });
  //});


  // Configura WebSocket para actualización en tiempo real

  const interval = setInterval(() => {
  //wss.on('connection', (ws) => {
    // Cada vez que un cliente se conecte, consulta el último registro y envíalo
    conexionDB.query('SELECT remitente, mensaje FROM mensajes ORDER BY id DESC LIMIT 1', (error, resultados) => {
      if (error) {
        console.error('Error al obtener datos:', error);
        return;
      }
      if (resultados.length > 0) {
        const data = JSON.stringify(resultados[0]);
        //ws.send(JSON.stringify(resultados[0]));
        if (data !== lastSentMessage){
          res.write(`data: ${data}\n\n`);
          lastSentMessage = data;
        }
      }
    });
  },1);

  req.on('close', () => {
    clearInterval(interval);
  });
});
  

const puerto = 3001; // Puerto en el que se ejecutará el servidor
server.listen(puerto, () => {
  console.log(`Servidor web en ejecución en http://localhost:${puerto}`);
});
