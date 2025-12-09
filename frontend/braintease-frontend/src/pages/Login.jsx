// import { signInWithPopup } from "firebase/auth";
// import { auth, provider } from "../firebase";

// function Login() {
//   const login = async () => {
//     const result = await signInWithPopup(auth, provider);
//     console.log("Logged in:", result.user);
//   };

//   return <button onClick={login}>Sign in with Google</button>;
// }

// export default Login;
export default function Login() {
    return (
      <div>
        <h2>Login Page</h2>
        <p>Google Login will go here.</p>
      </div>
    );
  }
  