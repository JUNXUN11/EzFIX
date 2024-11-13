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
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return; // TODO: ADD ERROR HANDLING
    
    setIsLoading(true);
    try {
      const result = await login(username, password);
      console.log('Login result:', result); 
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex justify-center items-center">
      <section className="m-8 flex w-full max-w-5xl rounded-3xl shadow-lg overflow-hidden bg-white">
        <div className="w-full lg:w-3/5 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-6">
            <Typography variant="h2" className="font-bold text-gray-800 mb-2">
              Sign In
            </Typography>
            <Typography
              variant="paragraph"
              color="blue-gray"
              className="text-lg font-normal"
            >
              Enter your username and password to Sign In.
            </Typography>
          </div>
          <form
            className="w-full px-8 lg:px-16"
            onSubmit={handleSubmit}
          >
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
                placeholder="username"
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
                Password
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              className="mt-16 py-3 rounded-lg relative flex items-center justify-center gap-2"
              fullWidth
              type="submit"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <Typography
              variant="paragraph"
              className="text-center text-blue-gray-500 font-medium mt-4"
            >
              Not registered?
              <Link to="/auth/sign-up" className="text-gray-900 ml-1">
                Create account
              </Link>
            </Typography>
          </form>
        </div>
        <div className="w-2/5 hidden lg:block">
          <img
            src="/img/KTDI_p2.jpg"
            className="h-full w-full object-cover"
            alt="Pattern background"
          />
        </div>
      </section>
    </div>
  );
}

export default SignIn;