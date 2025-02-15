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

interface arbiter_v1WithDate
  extends Omit<
    arbiter_v1,
    "id" | "created_at" | "summary_raw" | "summary_translated"
  > {
  id: number;
  created_at: string | null;
  summary_raw: string | null;
  summary_translated: string | null;
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
      posts: posts.map((post: arbiter_v1) => ({
        id: Number(post.id),
        url: post.url,
        summary_raw: post.summary_raw,
        summary_translated: post.summary_translated,
        created_at: post.created_at ? post.created_at.toISOString() : null,
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
    let mostRecentViewedArticle = Number(
      localStorage.getItem("mostRecentViewedArticle") || "0"
    );
    console.log(
      "Most recent viewed article from localStorage:",
      mostRecentViewedArticle
    );

    // Update the state
    const updatedPosts = posts.map((post) => ({
      ...post,
      viewed: post.id <= mostRecentViewedArticle,
      localDate: post.created_at
        ? formatDate(new Date(post.created_at).toISOString())
        : null,
    }));

    // Group the posts by local date
    const grouped = groupBy(updatedPosts, "localDate");
    setGroupedPosts(grouped);
  }, [posts]);

  const handleArticleRender = (postId: number) => {
    let mostRecentViewedArticle = Number(
      localStorage.getItem("mostRecentViewedArticle") || "0"
    );

    if (postId > mostRecentViewedArticle) {
      localStorage.setItem("mostRecentViewedArticle", postId.toString());
    }
  };

  return (
    <>
      <div className="grid gap-4 mx-4 prose md:gap-1 md:mx-auto">
        <img src="masthead.png" />
        {Object.entries(groupedPosts).map(([date, posts]) => (
          <div key={date}>
            <h2 className="my-4">{date}</h2>
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
