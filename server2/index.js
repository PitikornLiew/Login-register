const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const SECRET = 'SON PANYAPIWAT'

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

const db = mysql.createConnection('mysql://ttvkqtqs6ghpyx1hl0lw:pscale_pw_6SSPleFQI2d80HpSXVJQT4vOetR0FifGw7jlv3MhUZo@us-east.connect.psdb.cloud/allonline?ssl={"rejectUnauthorized":true}')

app.post('/register', async (req, res, err) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email;
    const password = req.body.password;

    const connect = await db;
    const [result] = await connect.query('select * from users where email = ?', [email])

    if (result.length === 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await connect.query('insert into users (fname, lname, email, password) VALUES (?,?,?,?)', [fname, lname, email, hashedPassword])
        return res.status(200).send({ "status": "Create Success" })
    } else {
        return res.status(400).send({ "status": "email Already" })
    }

})
app.post("/login", async (req, res) => {
    const email = req.body.email;
    const database = await db
    const rows = await database.query
        ('SELECT * FROM users WHERE email = ?', [email]);
    if (rows[0].length > 0) {
        const hashedPassword = rows[0][0].password;
        const userId = rows[0][0].id;
        const loginPassword = req.body.password;
        const same = await bcrypt.compare(loginPassword, hashedPassword)

        if (!same) {
            res.status(403).send({ "status": 'password incorrect' })
        } else {
            const token = jwt.sign({ id: userId }, SECRET, { expiresIn: 3600 })
            res.status(200).send({ "staus": "login success", "token": token })
        }
    } else {
        res.status(404).send({ "status": "Username doesn't" })
    }

})

app.listen(3333, () => {
    console.log("Server is running");
})
