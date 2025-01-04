import PropTypes from "prop-types";
import { Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function Footer({ brandName, brandLink }) {
  const year = new Date().getFullYear();
  const { user } = useAuth();

    // Define routes based on user role
    const getRoutes = () => {
      const commonRoutes = [
        { name: "About Us", path: "https://studentaffairs.utm.my/ktdi/" },
        { name: "Contact Us", path: "https://studentaffairs.utm.my/ktdi/hubungi-kami/" },
      ];
  
      // If not logged in, show default routes
      if (!user) {
        return [
          ...commonRoutes,
          { name: "Report Issues", path: "/auth/sign-in" }, 
        ];
      }
  
      if (user.role === "admin") {
        return [
          ...commonRoutes,
          { name: "Report Issues", path: "/dashboard/report-admin" },
        ];
      } else {
        return [
          ...commonRoutes,
          { name: "Report Issues", path: "/dashboard/createreport" },
        ];
      }
    };
  
    const routes = getRoutes();

  return (
    <footer className="px-3 mt-10">
      <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
        <Typography variant="small" className="font-normal text-inherit">
          &copy; {year} by {" "}
          <a
            href={brandLink}
            target="_blank"
            className="transition-colors hover:text-blue-500 font-bold"
          >
            {brandName}
          </a>{" "}
          - "Report with Ease, Rest with Peace."
        </Typography>
        <ul className="flex items-center gap-4">
          {routes.map(({ name, path }) => (
            <li key={name}>
              {path.startsWith('http') ? (
                // External link
                <Typography
                  as="a"
                  href={path}
                  target="_blank"
                  variant="small"
                  className="py-0.5 px-1 font-normal text-inherit transition-colors hover:text-blue-500"
                >
                  {name}
                </Typography>
              ) : (
                // Internal link
                <Typography
                  as={Link}
                  to={path}
                  variant="small"
                  className="py-0.5 px-1 font-normal text-inherit transition-colors hover:text-blue-500"
                >
                  {name}
                </Typography>
              )}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  brandName: "TechSquad",
  routes: [
    { name: "About Us", path: "https://studentaffairs.utm.my/ktdi/" },
    { name: "Report Issues", path: "/dashboard/createreport" }, // Updated this line
    { name: "Contact Us", path: "https://studentaffairs.utm.my/ktdi/hubungi-kami/" },
  ],
};

Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
};

Footer.displayName = "/src/widgets/layout/footer.jsx";

export default Footer;
