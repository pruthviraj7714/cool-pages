import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/config/config";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const signUpFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Email should be valid" }),
  password: z
    .string()
    .min(6, { message: "Password should be at least of 6 characters" }),
});

const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signUpFormSchema>) {
    setIsLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/user/signup`, {
        username: values.username,
        password: values.password,
        email: values.email,
      });
      toast.success(res.data.message, {
        description: "Now login with your credentials",
      });
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 py-3">
      <div className="w-[450px] flex flex-col items-center border border-black/25 rounded-xl shadow-xl p-5">
        <h1 className="font-bold text-3xl text-black my-2">Join Now</h1>
        <p className="font-semibold text-xl text-gray-500 my-2">
          Create an Account
        </p>
        <div className="w-full p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="******" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={isLoading}
                className={`${isLoading ? "bg-gray-400" : ""}`}
                type="submit"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <div>Submit</div>
                )}
              </Button>
            </form>
          </Form>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-sans">Already have an Account?</span>
          <Link
            className="text-blue-500 underline hover:text-blue-500"
            to={"/login"}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
