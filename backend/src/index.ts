import express, { Request, Response } from "express"
import cors from "cors"
import userRouter from "./routers/userRouter";
import "./db"
import { config } from "dotenv";
import { pageRouter } from "./routers/pageRouter";
config()

const PORT = process.env.PORT ?? 3000;

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', async (req : Request, res : Response ) : Promise<any> => {
    return res.status(200).json({
        message : "Running successfully"
    })
})

app.use('/api/v1/user', userRouter);
app.use('/api/v1/pages', pageRouter);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})