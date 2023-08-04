"use client";
import { useEffect, useState } from "react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function Page() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await prisma.academia.findMany({
        orderBy: { id: "asc" },
      });
      setPosts(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>{/* Render your post here */}</div>
      ))}
    </div>
  );
}
