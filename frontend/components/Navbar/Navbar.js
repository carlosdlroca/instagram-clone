import React from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
    return <nav className={styles.Navbar}>
        <a>Sign up</a>
        <a>Sign In</a>
    </nav>
}