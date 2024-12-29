import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      await resetPassword(email);
      setMessage("A password reset link has been sent to your email.");
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("Failed to send password reset link. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex justify-center items-center">
      <section className="m-8 flex w-full max-w-[700px] rounded-3xl shadow-lg overflow-hidden bg-white">
        <div className="w-full flex flex-col items-center justify-center p-8">
          <div className="text-center mb-6">
            <Typography variant="h2" className="font-bold text-gray-800 mb-2">
              Forgot Password
            </Typography>
            <Typography
              variant="paragraph"
              color="blue-gray"
              className="text-lg font-normal"
            >
              Enter your email to reset your password.
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
                Email Address
              </Typography>
              <Input
                size="lg"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 !border-t-blue-gray-200 focus:!border-t-gray-900 rounded-lg"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            {message && (
              <Typography
                variant="small"
                color={message.includes("Failed") ? "red" : "green"}
                className="mt-2 text-center"
              >
                {message}
              </Typography>
            )}

            <Button
              className="mt-16 py-3 rounded-lg relative flex items-center justify-center gap-2"
              fullWidth
              type="submit"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Sending...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
            <Typography
              variant="paragraph"
              className="text-center text-blue-gray-500 font-medium mt-4"
            >
              Remembered your password?
              <Link to="/auth/sign-in" className="text-gray-900 ml-1">
                Sign In
              </Link>
            </Typography>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ForgetPassword;
