import { useState } from 'react';
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
      // TODO: add error handling
    }
    await register(username, email, password);
    navigate("/dashboard/home");
  };

  return (
    <div className="h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex justify-center items-center">
      <section className="m-8 flex w-full max-w-5xl rounded-3xl shadow-lg overflow-hidden bg-white">
        <div className="w-2/5 hidden lg:block">
          <img
            src="/img/pattern.png"
            className="h-full w-full object-cover"
            alt="Pattern background"
          />
        </div>
        <div className="w-full lg:w-3/5 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-6">
            <Typography variant="h2" className="font-bold text-gray-800 mb-2">
              Join Us Today
            </Typography>
            <Typography
              variant="paragraph"
              color="blue-gray"
              className="text-lg font-normal"
            >
              Create your account to get started.
            </Typography>
          </div>
          <form onSubmit={handleSubmit} className="w-full px-8 lg:px-16">
            <div className="mb-5">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-medium"
              >
                Username
              </Typography>
              <Input
                size="lg"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 !border-t-blue-gray-200 focus:!border-t-gray-900 rounded-lg"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <div className="mb-5">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-medium"
              >
                Email
              </Typography>
              <Input
                size="lg"
                type="email"
                placeholder="name@graduate.utm.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 !border-t-blue-gray-200 focus:!border-t-gray-900 rounded-lg"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <div className="mb-5">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-medium"
              >
                Password
              </Typography>
              <Input
                size="lg"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 !border-t-blue-gray-200 focus:!border-t-gray-900 rounded-lg"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <div className="mb-5">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-medium"
              >
                Confirm Password
              </Typography>
              <Input
                size="lg"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 !border-t-blue-gray-200 focus:!border-t-gray-900 rounded-lg"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            {error && (
              <Typography
                variant="small"
                color="red"
                className="mt-2 text-center"
              >
                {error}
              </Typography>
            )}

            <Button
              className="mt-12 py-3 rounded-lg"
              fullWidth
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Now"}
            </Button>
            <Typography
              variant="paragraph"
              className="text-center text-blue-gray-500 font-medium mt-4"
            >
              Already have an account?
              <Link to="/auth/sign-in" className="text-gray-900 ml-1">
                Sign in
              </Link>
            </Typography>
          </form>
        </div>
      </section>
    </div>
  );
}

export default SignUp;
