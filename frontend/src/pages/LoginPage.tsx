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

const logInFormSchema = z.object({
  username: z.string(),
  password: z
    .string()});

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState(false);
  const form = useForm<z.infer<typeof logInFormSchema>>({
    resolver: zodResolver(logInFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof logInFormSchema>) {
    setisLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/user/login`, {
        username : values.username,
        password : values.password
      })
      toast.success(res.data.message);
      sessionStorage.setItem('authToken', res.data.token);
      navigate('/dashboard');
    } catch (error : any) {
      toast.error(error.response.data.message);
    } finally {
      setisLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 py-3">
      <div className="w-[450px] flex flex-col items-center border border-black/25 rounded-xl shadow-xl p-5">
        <h1 className="font-bold text-3xl text-black my-2">Welcome Back!</h1>
        <p className="font-semibold text-xl text-gray-500 my-2">Enter your credentials</p>
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
                      <Input placeholder="Enter your username here" {...field} />
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
                      <Input placeholder="Enter your password here" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isLoading} className={`${isLoading ? 'bg-gray-400' : '' }`} type="submit">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin"/>
                    Loading...
                  </div>
                ) : (
                  <div className="">
                      Submit
                  </div>                  
                )}
              </Button>
            </form>
          </Form>
        </div>
        <div className="flex items-center gap-1.5">
            <span className="font-sans">Don&apos;t have an Account?</span>
            <Link className="text-blue-500 underline hover:text-blue-500" to={'/signup'}>Signup</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage