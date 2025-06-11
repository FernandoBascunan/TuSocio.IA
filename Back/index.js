const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const port = 3000;
const app = express();
app.use(cors());
app.use(bodyParser.json());
require('dotenv').config();
const crypto = require('crypto');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { PythonShell } = require('python-shell');


require('dotenv').config();
const SECRET = process.env.JWT_SECRET;

const passwordResetTokens = new Map();


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

  console.log(req.body)
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

    console.log(user)
    try { 
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'error compare' });
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
      res.status(500).json({ error});
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

//Recuperar Contraseña
app.post('/api/recuperar-password', (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Correo es requerido' });

  connection.query('SELECT * FROM empresa WHERE correoPyme = ?', [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'Correo no registrado' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    passwordResetTokens.set(token, email);

    const resetUrl = `http://localhost:8100/reset-password/${token}`; // Cliente

    console.log(`Enlace de recuperación enviado: ${resetUrl}`);

    // En producción: aquí deberías enviar el correo real usando nodemailer
    res.json({ message: 'Correo de recuperación enviado (ver consola)' });
  });
});

//Restablecer Contraseña
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const email = passwordResetTokens.get(token);

  if (!email) return res.status(400).json({ message: 'Token inválido o expirado' });

  const regex = /^[a-zA-Z0-9]{8,12}$/;
  if (!regex.test(newPassword)) return res.status(400).json({ message: 'Formato de contraseña inválido' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  connection.query(
    'UPDATE empresa SET password = ? WHERE correoPyme = ?',
    [hashedPassword, email],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error actualizando contraseña' });

      passwordResetTokens.delete(token);
      res.json({ message: 'Contraseña actualizada exitosamente' });
    }
  );
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

//Reportes

function createTablePDF(headers, data, title, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: 'center' }).moveDown(1.5);

  const startX = 50;
  let y = 100;
  const rowHeight = 25;
  const colWidth = 500 / headers.length;

  doc.fontSize(12).font('Helvetica-Bold');

  // Dibujar encabezado
  headers.forEach((header, i) => {
    doc
      .rect(startX + i * colWidth, y, colWidth, rowHeight)
      .stroke()
      .text(header.toUpperCase(), startX + i * colWidth + 5, y + 7, {
        width: colWidth - 10,
        align: 'left',
      });
  });

  y += rowHeight;
  doc.font('Helvetica');

  // Dibujar filas
  data.forEach(row => {
    headers.forEach((key, i) => {
      doc
        .rect(startX + i * colWidth, y, colWidth, rowHeight)
        .stroke()
        .text(String(row[key] ?? ''), startX + i * colWidth + 5, y + 7, {
          width: colWidth - 10,
          align: 'left',
        });
    });
    y += rowHeight;

    // Salto de página si se pasa
    if (y + rowHeight > doc.page.height - 50) {
      doc.addPage();
      y = 100;
    }
  });

  doc.end();
}
app.get('/api/reportes/1', (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(fechaVenta, '%Y-%m') AS mes,
      SUM(valorTotal) AS totalVentas
    FROM ventas
    GROUP BY mes
    ORDER BY mes DESC
  `;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al generar reporte de ventas' });

    createTablePDF(['mes', 'totalVentas'], results, 'Informe de Ventas Mensuales', res);
  });
});
app.get('/api/reportes/2', (req, res) => {
  const query = `
    SELECT 
      p.idProducto,
      p.nombreProducto,
      p.tipoProducto,
      COUNT(i.idProducto) AS stock
    FROM inventario i
    JOIN producto p ON i.idProducto = p.idProducto
    GROUP BY p.idProducto
  `;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al generar reporte de stock' });

    createTablePDF(['idProducto', 'nombreProducto', 'tipoProducto', 'stock'], results, 'Reporte de Stock Actual', res);
  });
});
app.get('/api/reportes/3', (req, res) => {
  const query = `
    SELECT 
      (SELECT SUM(valorTotal) FROM ventas) AS ingresos,
      (SELECT SUM(dv.cantidad * p.valorNeto) 
         FROM detalleventa dv 
         JOIN producto p ON dv.idProducto = p.idProducto
      ) AS costoVentas,
      ((SELECT SUM(valorTotal) FROM ventas) -
       (SELECT SUM(dv.cantidad * p.valorNeto) 
          FROM detalleventa dv 
          JOIN producto p ON dv.idProducto = p.idProducto)) AS utilidad
  `;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al generar estado de resultados' });

    const rows = [results[0]];
    createTablePDF(['ingresos', 'costoVentas', 'utilidad'], rows, 'Estado de Resultados', res);
  });
});

app.get('/api/reportes/4', async (req, res) => {
  const query = `
    SELECT 
      (SELECT SUM(valorTotal) FROM ventas) AS ingresos,
      (SELECT SUM(dv.cantidad * p.valorNeto) 
         FROM detalleventa dv 
         JOIN producto p ON dv.idProducto = p.idProducto
      ) AS costoVentas,
      ((SELECT SUM(valorTotal) FROM ventas) -
       (SELECT SUM(dv.cantidad * p.valorNeto) 
          FROM detalleventa dv 
          JOIN producto p ON dv.idProducto = p.idProducto)) AS utilidad
  `;

  connection.query(query, async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al generar estado de resultados' });

    const data = results[0];
    const ingresos = data.ingresos || 0;
    const costoVentas = data.costoVentas || 0;
    const utilidad = data.utilidad || 0;

    // Generar gráfico
    const width = 600;
    const height = 400;
    const chartCanvas = new ChartJSNodeCanvas({ width, height });

    const configuration = {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Costo de Ventas', 'Utilidad'],
        datasets: [{
          label: 'Proyeccion de demanda',
          data: [ingresos, costoVentas, utilidad],
          backgroundColor: ['#4CAF50', '#F44336', '#2196F3']
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    const imageBuffer = await chartCanvas.renderToBuffer(configuration);

    // Crear PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=estado_resultados.pdf');

    doc.fontSize(20).text('Proyeccion de demanda', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Ingresos: $${ingresos}`);
    doc.text(`Costo de Ventas: $${costoVentas}`);
    doc.text(`Utilidad: $${utilidad}`);
    doc.moveDown();

    doc.image(imageBuffer, {
      fit: [500, 300],
      align: 'center',
      valign: 'center'
    });

    doc.end();
    doc.pipe(res);
  });
});




//Inventario

app.get('/api/productos', (req, res) => {
  connection.query('SELECT * FROM producto', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos' });
    res.json(results);
  });
});

app.delete('/api/productos/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'TuSocio.IA2.0'
    });

    // Elimina del inventario primero
    await connection.execute(
      'DELETE FROM inventario WHERE idProducto = ?',
      [id]
    );

    // Ahora sí elimina el producto
    await connection.execute(
      'DELETE FROM producto WHERE idProducto = ?',
      [id]
    );

    await connection.end();
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

app.put('/api/productos/:id', (req, res) => {
  const id = req.params.id;
  const {
    valorNeto,
    tipoProducto,
    unidadMedida,
    fechaIngreso,
    fechaCaducidad
  } = req.body;

  const sql = `
    UPDATE producto SET 
      valorNeto = ?, 
      tipoProducto = ?, 
      unidadMedida = ?, 
      fechaIngreso = ?, 
      fechaCaducidad = ?
    WHERE idProducto = ?
  `;

  connection.query(sql, [valorNeto, tipoProducto, unidadMedida, fechaIngreso, fechaCaducidad, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar producto' });
    res.json({ message: 'Producto actualizado correctamente' });
  });
});


const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ mensaje: 'Token inválido' });

    req.user = decoded; // guarda el payload en req.user
    next();
  });
};


app.post('/api/productos', autenticarToken, async (req, res) => {
  const {
    idProducto,
    nombreProducto,
    valorNeto,
    tipoProducto,
    unidadMedida,
    fechaIngreso,
    fechaCaducidad
  } = req.body;

  const rutEmpresa = req.user.id; // Asumimos que en el token el campo es "rut"

  if (!rutEmpresa) {
    return res.status(400).json({ mensaje: 'Rut empresa no encontrado en token' });
  }

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'TuSocio.IA2.0'
    });

    // Inserta en tabla producto
    await connection.execute(
      `INSERT INTO producto 
       (idProducto, nombreProducto, valorNeto, tipoProducto, unidadMedida, fechaIngreso, fechaCaducidad) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [idProducto, nombreProducto, valorNeto, tipoProducto, unidadMedida, fechaIngreso, fechaCaducidad]
    );

    // Inserta en tabla inventario con rutEmpresa
    await connection.execute(
      `INSERT INTO inventario (RutEmpresa, idProducto) VALUES (?, ?)`,
      [rutEmpresa, idProducto]
    );

    await connection.end();

    res.json({ mensaje: 'Producto agregado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

app.get('/api/productos/:id', (req, res) => {
  const id = req.params.id;
  connection.query(
    'SELECT * FROM producto WHERE idProducto = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener producto' });
      if (results.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(results[0]);
    }
  );
});
