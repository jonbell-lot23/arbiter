import { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { PrismaClient, arbiter_v1 } from "@prisma/client";
import ReactMarkdown from "react-markdown";
import "../app/globals.css";
import styles from "./styles.module.css";

interface Props {
  posts: arbiter_v1WithDate[];
}

interface arbiter_v1WithDate extends arbiter_v1 {
  created_at: Date;
  viewed?: boolean;
}

const prisma = new PrismaClient();

export async function getStaticProps() {
  const posts = await prisma.arbiter_v1.findMany({
    orderBy: { id: "desc" },
    take: 50,
  });

  return {
    props: {
      posts: posts.map((post) => ({
        id: Number(post.id),
        url: post.url,
        summary_raw: post.summary_raw,
        summary_translated: post.summary_translated,
        created_at: post.created_at
          ? new Date(post.created_at).toISOString()
          : null,
      })),
    },
  };
}

const Home: NextPage<Props> = ({ posts }) => {
  const [sortedPosts, setSortedPosts] = useState<arbiter_v1WithDate[]>([]);

  useEffect(() => {
    console.log("Running useEffect");
    let viewedArticles = JSON.parse(
      localStorage.getItem("viewedArticles") || "[]"
    );
    console.log("Viewed articles from localStorage:", viewedArticles);

    // Add all new articles to the viewed list
    const newArticleIds = posts
      .map((post) => post.id)
      .filter((id) => !viewedArticles.includes(id));
    console.log("New article IDs:", newArticleIds);
    viewedArticles = [...viewedArticles, ...newArticleIds];
    localStorage.setItem("viewedArticles", JSON.stringify(viewedArticles));
    console.log("Updated viewed articles:", viewedArticles);

    // Update the state
    const updatedPosts = posts.map((post) => ({
      ...post,
      viewed: viewedArticles.includes(post.id),
    }));
    console.log("Updated posts:", updatedPosts);
    setSortedPosts(updatedPosts);
  }, [posts]);

  return (
    <>
      <Head>
        <title>Arbiter</title>
        <meta name="description" content="Arbiter" />
      </Head>
      <div className="max-w-screen-md min-h-screen mx-auto">
        <div className="px-4 py-8 mx-auto text-left">
          <h1 className="mb-8 text-2xl font-bold text-center">
            Arbiter: Politics
          </h1>
          <div className="grid gap-1 mx-auto prose">
            {sortedPosts.map((post) => (
              <div
                key={post.id.toString()}
                className={
                  post.viewed
                    ? `${styles.article} ${styles.viewed}`
                    : `${styles.article} ${styles.notViewed}`
                }
              >
                <ReactMarkdown
                  className="mx-auto text-sm prose prose-lg"
                  // eslint-disable-next-line react/no-children-prop
                  children={
                    post.summary_translated
                      ? post.summary_translated
                      : post.summary_raw || ""
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
