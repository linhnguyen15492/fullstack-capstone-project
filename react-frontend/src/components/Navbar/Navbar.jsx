import React from "react";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="/">
        GiftLink
      </a>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" href="/home.html">
              Home
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="/app">
              Gifts
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="/app/login">
              Login
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/app/register">
              Register
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
