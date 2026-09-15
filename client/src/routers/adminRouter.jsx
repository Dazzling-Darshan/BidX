import { AdminLayout } from "../layout/AdminLayout";
import { AdminDashboard } from "../pages/Admin/AdminDashboard";
import { UsersList } from "../pages/Admin/UsersList";
import { AdminAuctions } from "../pages/Admin/AdminAuctions";
import { AdminMessages } from "../pages/Admin/AdminMessages";

export const adminRouter = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <UsersList />,
      },
      {
        path: "auctions",
        element: <AdminAuctions />,
      },
      {
        path: "messages",
        element: <AdminMessages />,
      },
    ],
  },
];