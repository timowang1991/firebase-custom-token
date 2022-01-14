const express = require('express');

const { getAuth, signInWithCustomToken } = require('firebase/auth');

const admin = require('./configs/firebase-admin');
require('./configs/firebase');

const auth = getAuth();

const app = express();

app.use(express.json());

app.post('/be/signin', (req, res) => {
    const { email } = req.body;
    admin.auth().createCustomToken(email)
        .then((customToken) => {
            console.log('----- customToken', customToken);
            res.send({ token: customToken });
        })
        .catch((err) => {
            console.log('----- createCustomToken err', err);
            res.status(500).send('something wrong');
        });
});

app.post('/fe/signin', (req, res) => {
    const { token } = req.body;

    signInWithCustomToken(auth, token)
        .then((userCredential) => {
            console.log('------- userCredential', userCredential);
            res.send(userCredential);
        }).catch((err) => {
            console.log('--- signInWithCustomToken err', err);
            res.status(500).send('not ok');
        });
});

app.get('/be/me', async (req, res) => {
    const { authorization } = req.headers;
    try {
        const decodeValue = await admin.auth().verifyIdToken(authorization);
        if (decodeValue) {
            return res.send(decodeValue);
        }
        return res.status(401).json({
            message: 'unauthorized',
        });
    } catch (error) {
        console.log('decode token error', error);

        return res.status(500).json({
            message: 'Internal Error',
        });
    }
});

app.listen(8080, () => {
    console.log('server listening on', 8080);
});
