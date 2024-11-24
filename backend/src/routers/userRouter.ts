import { Request, response, Response, Router } from "express";
import { SignInSchema, SignUpSchema } from "../types/schema";
import { compare, hash } from "bcrypt";
import { User } from "../models/user";
import { sign } from "jsonwebtoken";
import { config } from "dotenv";
config();

const userRouter = Router();

userRouter.post(
  "/signup",
  async (req: Request, res: Response): Promise<any> => {
    const parsedBody = SignUpSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Invalid Inputs",
        error: parsedBody.error.format(),
      });
    }
    const { email, password, username } = parsedBody.data;

    const isUserAlreadyExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      return res.status(409).json({
        message: "User with similar username or email already exists",
      });
    }

    const hashedPassword = await hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(200).json({
      message: "User Successfully Created",
    });
  }
);

userRouter.post("/login", async (req: Request, res: Response): Promise<any> => {
  const parsedBody = SignInSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      message: "Invalid Inputs",
      error: parsedBody.error.format(),
    });
  }

  const { username, password } = parsedBody.data;

  try {
    const isUserExist = await User.findOne({
      username,
    });

    if (!isUserExist) {
      return res.status(400).json({
        message: "User not found!",
      });
    }

    const isPasswordValid = await compare(password, isUserExist.password!);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Incorrect Password",
      });
    }

    const token = sign(
      {
        id: isUserExist._id,
      },
      process.env.JWT_SECRET ?? ""
    );

    return res.status(200).json({
      message: "Successfully Logged In",
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default userRouter;
