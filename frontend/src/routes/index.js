import { Navigate, createBrowserRouter } from "react-router-dom";
import Root from "./root";
import ErrorRoute from "./error";
import ArenaRoute from "./arena";
import AllAvatarsRoute from "./all-avatars";
import MyAvatarsRoute from "./my-avatars";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorRoute />,
    children: [
      {
        path: "arena",
        element: <ArenaRoute />,
      },
      {
        path: "all-avatars",
        element: <AllAvatarsRoute />,
      },
      {
        path: "my-avatars",
        element: <MyAvatarsRoute />,
      },
      { index: true, element: <Navigate to="/all-avatars" /> },
    ],
  },
]);

export default router;
