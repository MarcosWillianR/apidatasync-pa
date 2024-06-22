"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  password: z.string().min(4, { message: "Insira uma senha válida" }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: UserFormValue) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl: callbackUrl ?? "/dashboard",
    });
    setIsLoading(false);
    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Ops, problema à vista!",
        description: result?.error,
      });
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-full">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Insira seu e-mail" disabled={isLoading} {...field} />
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
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Insira sua senha" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex flex-col items-center">
            <Button isLoading={isLoading} className="ml-auto w-full" type="submit">
              Entrar
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
