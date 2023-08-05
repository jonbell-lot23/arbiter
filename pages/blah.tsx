import { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { PrismaClient, academia } from "@prisma/client";
import styles from "../styles/blog.module.css";

interface Props {
  posts: academiaWithDate[];
}

interface academiaWithDate extends academia {
  created_at: Date;
}

const prisma = new PrismaClient();

export async function getStaticProps() {
  const posts = await prisma.academia.findMany({
    orderBy: { id: "asc" },
  });

  return {
    props: {
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        body: post.body,
        created_at: new Date(post.created_at).toISOString(),
      })),
    },
  };
}

const Home: NextPage<Props> = ({ posts }) => {
  const [sortedPosts, setSortedPosts] = useState<academia[]>([]);

  useEffect(() => {
    setSortedPosts(posts);
  }, [posts]);

  return (
    <>
      <Head>
        <title>Jon&apos;s Adventures in Academia</title>
        <meta name="description" content="Jon's Adventures in Academia" />
      </Head>
      <div className="max-w-screen-md min-h-screen mx-auto">
        <div className="px-4 py-8 mx-auto">
          <h1 className="mb-8 text-4xl font-bold text-center">Header</h1>
          <div className="grid gap-4 mx-auto prose">
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 transition-all duration-300 rounded-lg"
              >
                <h2 className="mb-2 text-3xl font-bold">{post.title}</h2>
                <div className="mb-4 text-gray-600">
                  {post.created_at ? (
                    <div>{new Date(post.created_at).toLocaleDateString()}</div>
                  ) : (
                    ""
                  )}
                </div>
                {post.body}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
