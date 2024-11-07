import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="h-screen overflow-hidden">
      <section className="m-8 flex gap-4">
        <div className="w-full lg:w-3/5 mt-24">
          <div className="text-center">
            <Typography variant="h2" className="font-bold mb-4">
              Sign In
            </Typography>
            <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
              Enter your username and password to Sign In.
            </Typography>
          </div>
          <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                Username
              </Typography>
              <Input
                size="lg"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}               
              />
              <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                Password
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}              
              />
            </div>
            {error && (
              <Typography variant="small" color="red" className="mt-2 text-center">
                {error}
              </Typography>
            )}
            <Button className="mt-6" fullWidth type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
              Not registered?
              <Link to="/auth/sign-up" className="text-gray-900 ml-1">Create account</Link>
            </Typography>
          </form>
        </div>
        <div className="w-2/5 hidden lg:block">
          <img
            src="/img/pattern.png"
            className="h-3/4 w-full object-cover rounded-3xl"
            alt="Pattern"
          />
        </div>
      </section>
    </div>
  );
}

export default SignIn;