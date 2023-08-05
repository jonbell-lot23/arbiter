"use client";

import { useState, useEffect } from "react";
import { supabase } from "./api/supabase";

type Post = {
  id: number;
  created_at: Date | null;
  title: string | null;
  body: string | null;
};

export default function HelloWorld() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("id", { ascending: true });
      setPosts(data || []);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Hello World!</h1>
      {posts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}
