"use client";

export default function Login() {
  const login = async () => {
    const res = await fetch("http://localhost:5000/auth/google");
    const data = await res.json();
    window.location.href = data.auth_url;
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <button
        onClick={login}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg"
      >
        Sign in with Google
      </button>
    </div>
  );
}
