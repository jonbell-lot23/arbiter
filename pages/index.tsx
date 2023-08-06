import { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { PrismaClient, arbiter_v1 } from "@prisma/client";
import ReactMarkdown from "react-markdown";
import "../app/globals.css";
import styles from "./styles.module.css";
import groupBy from "lodash.groupby";

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
        created_at: post.created_at || null,
      })),
    },
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toLocaleDateString() === today.toLocaleDateString()) {
    return "Today";
  } else if (date.toLocaleDateString() === yesterday.toLocaleDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
}

const Home: NextPage<Props> = ({ posts }) => {
  const [groupedPosts, setGroupedPosts] = useState<{
    [key: string]: arbiter_v1WithDate[];
  }>({});

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
      // convert the date to local date
      localDate: post.created_at
        ? formatDate(post.created_at.toISOString())
        : null,
    }));
    console.log("Updated posts:", updatedPosts);

    // Group the posts by local date
    const grouped = groupBy(updatedPosts, "localDate");
    setGroupedPosts(grouped);
  }, [posts]);

  useEffect(() => {
    Object.values(groupedPosts)
      .flat()
      .forEach((post) => {
        if (!post.viewed) {
          handleArticleRender(post.id);
        }
      });
  }, [groupedPosts]);

  const handleArticleRender = (postId: bigint) => {
    let viewedArticles = JSON.parse(
      localStorage.getItem("viewedArticles") || "[]"
    ).map(Number);

    if (!viewedArticles.includes(Number(postId))) {
      viewedArticles.push(Number(postId));
      localStorage.setItem("viewedArticles", JSON.stringify(viewedArticles));
    }
  };

  return (
    <>
      <div className="grid gap-1 mx-auto prose">
        {Object.entries(groupedPosts).map(([date, posts]) => (
          <div key={date}>
            <h2>{date}</h2>
            {posts.map((post) => (
              <div
                key={post.id.toString()}
                className={
                  post.viewed
                    ? `${styles.article} ${styles.viewed}`
                    : `${styles.article} ${styles.notViewed}`
                }
              >
                <ReactMarkdown
                  className="mx-auto prose text-md"
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
        ))}
      </div>
    </>
  );
};

export default Home;
