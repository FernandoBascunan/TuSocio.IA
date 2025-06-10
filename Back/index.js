const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const port = 3000;
const app = express();
app.use(cors());
app.use(bodyParser.json());
require('dotenv').config();


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'TuSocio.IA2.0'
});


//Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
const Rut = email;

  if (!Rut || !password) {
    return res.status(400).json({ error: 'Rut o correo y contraseña son requeridos' });
  }

  // Determinar si es RUT o correo electrónico
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Rut);
  const searchField = isEmail ? 'correoPyme' : 'RutEmpresa';

  const query = `SELECT * FROM empresa WHERE ${searchField} = ?`;

  connection.query(query, [Rut], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const user = results[0];

    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const token = jwt.sign(
        {
          id: user.RutEmpresa,
          direccion: user.Direccion,
          tipoPyme: user.tipoPyme,
          registro: user.fechaRegistro,
          fono: user.fonoPyme,
          nombre: user.nombreCEO,
          apellido: user.apellidoCEO,
          correo: user.correoPyme,
        },
        process.env.JWT_SECRET || 'tu_clave_secreta_temporal',
        { expiresIn: '2h' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      res.status(500).json({ error: 'Error durante la verificación' });
    }
  });
});



//Registro
app.post('/api/register', async (req, res) => {
  const { rut, direccion, tipoPyme, registro, phone, firstname, lastname, email, password } = req.body;
  console.log('Valores antes de enviar:', {
        firstname,
        lastname,
        rut,
        registro,
        tipoPyme,
        direccion,
        email,
        phone,
        password,
      });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO empresa 
      (RutEmpresa, Direccion, tipoPyme, fechaRegistro, fonoPyme, nombreCEO, apellidoCEO, correoPyme, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
      query,
      [
        rut,      
        direccion,  
        tipoPyme,    
        registro,    
        phone,       
        firstname,    
        lastname,     
        email,       
        hashedPassword 
      ],
      (err) => {
        if (err) {
          console.error('Error al crear el usuario:', err);
          return res.status(500).json({ error: 'Error al crear el usuario' });
        }
        res.status(201).json({ message: 'Usuario creado con éxito' });
      }
    );
  } catch (error) {
    console.error('Error al encriptar la contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//Modificar datos de la empresa
app.put('/api/usuario/modificar', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_temporal', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });

    const rut = user.id;
    const { correo, direccion, fono, nombre, apellido } = req.body;

    const query = `
      UPDATE empresa SET 
        correoPyme = ?, 
        Direccion = ?, 
        fonoPyme = ?, 
        nombreCEO = ?, 
        apellidoCEO = ?
      WHERE RutEmpresa = ?
    `;

    connection.query(
      query,
      [correo, direccion, fono, nombre, apellido, rut],
      (err, result) => {
        if (err) {
          console.error('Error al actualizar el usuario:', err);
          return res.status(500).json({ error: 'Error al actualizar el usuario' });
        }

        res.json({ message: 'Datos actualizados correctamente' });
      }
    );
  });
});



app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        messages: [ { role: 'system', content: 'Eres un asistente que responde únicamente en español.' },{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;

    res.json({ respuesta: answer });
  } catch (error) {
    console.error('Error en backend con Ollama:', error);
    res.json({ respuesta: 'Error al contactar con la IA.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
