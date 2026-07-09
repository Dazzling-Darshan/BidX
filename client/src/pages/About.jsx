import { Link } from "react-router";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export const About = () => {
  useDocumentTitle("About");
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-sm shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            About This Project
          </h1>

          <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
            <p className="text-lg">
              Welcome to the Auction Platform — a full-stack real-time bidding
              application built using the MERN stack.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About This Project
              </h2>
              <p>
                This project was built as a personal learning exercise to
                practice modern full-stack web development. It covers
                real-time communication with Socket.io, JWT authentication,
                role-based access control, cloud image uploads, and building a
                complete REST API with Express and MongoDB.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Key Features
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>User registration and authentication (JWT + httpOnly cookies)</li>
                <li>Real-time auction bidding with Socket.io</li>
                <li>Item listing and management with Cloudinary image upload</li>
                <li>Admin panel for managing users and auctions</li>
                <li>Responsive design for all devices</li>
                <li>Login history and security tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tech Stack
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Frontend:</strong> React 19, Vite, Tailwind CSS v4, Redux Toolkit, React Query, Socket.io Client</li>
                <li><strong>Backend:</strong> Node.js, Express 5, MongoDB, Mongoose, Socket.io, JWT, bcrypt</li>
                <li><strong>Services:</strong> Cloudinary (images), Resend (email)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Developer
              </h2>
              <p>
                Built by <strong>Darshan Prajapati</strong> as a personal
                learning project to explore full-stack MERN development with
                real-time features.
              </p>

              <div className="mt-4 p-4 bg-gray-50 rounded-sm">
                <p className="font-medium text-gray-900 mb-2">
                  Find me on GitHub:
                </p>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">GitHub Profile:</span>{" "}
                    <a
                      href="https://github.com/Dazzling-Darshan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      github.com/Dazzling-Darshan
                    </a>
                  </p>
                  <p>
                    <span className="font-medium">Project Repository:</span>{" "}
                    <a
                      href="https://github.com/Dazzling-Darshan/auction-platform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      github.com/Dazzling-Darshan/auction-platform
                    </a>
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-center">
                Have questions or need support? Feel free to{" "}
                <Link
                  to="/contact"
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  contact me
                </Link>{" "}
                for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
