require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 8000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@projectscluster.sralaww.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const main = async () => {
    try {
        await client.connect();
        console.log('Database Connected successfully 🆗');

        const usersCollection = client.db('book-finder').collection('users');
        const booksCollection = client.db('book-finder').collection('books');

        // INFO: users
        app.get('/api/v1/users', async (req, res) => {
            const result = await usersCollection.find({}).toArray();
            res.send(result);
        });

        app.get('/api/v1/users/:email', async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.findOne({ email: email })
            res.send(result);
        });

        app.post('/api/v1/users', async (req, res) => {
            const user = req.body;
            if (user?.role === "user") {
                user.wishlist = [];
                user.currently_reading = [];
                user.finished_reading = [];
            } else if (user?.role === "author") {
                user.total_books = 0;
            }
            const result = await usersCollection.insertOne(user)
            res.send(result);
        });

        // INFO: books
        app.get('/api/v1/books', async (req, res) => {
            const result = await booksCollection.find({}).toArray();
            res.send(result);
        });

        app.get('/api/v1/book/:id', async (req, res) => {
            const id = req.params.id;
            const result = await booksCollection.find({ _id: new ObjectId(id) }).toArray();
            console.log(result);
            res.send(result);
        })

       
    } finally {
        // await client.close();
    }
}

main().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Book Finder Server is Running...');
});

app.listen(port, () => {
    console.log(`Book Finder app listening on port ${port}`);
});