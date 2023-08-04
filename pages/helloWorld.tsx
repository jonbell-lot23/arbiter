import { useState, useEffect } from "react";

export default function HelloWorld() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.text));
  }, []);

  return (
    <div>
      <h1>Hello World!</h1>
      <p>{message}</p>
    </div>
  );
}
