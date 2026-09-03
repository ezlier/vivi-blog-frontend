import { defineStore } from "pinia";
import { ref } from "vue";
import { getArticles, getArticle } from "@/api/article";
import { getTags } from "@/api/tag";

export const useArticleStore = defineStore("article", () => {
  const articles = ref<Article[]>([]);
  const articleList = ref<Article[]>([]);
  const currentArticle = ref<Article | null>(null);
  const tags = ref<Tag[]>([]);
  const total = ref(0);
  const loading = ref(false);

  async function fetchArticles(page = 1, pageSize = 10) {
    loading.value = true;
    try {
      const res = await getArticles({ page, page_size: pageSize });
      const responseData = res.data;
      const payload = responseData.data.articles;
      articles.value = payload.items.map((article: Article) => ({
        ...article,
        created_time: article.created_at,
        updated_time: article.updated_at,
        like_count: article.like_count ?? 0,
      }));
      total.value = payload.total;
    } finally {
      loading.value = false;
    }
  }

  async function fetchArticle(slug: string): Promise<Article> {
    const res = await getArticle(slug);
    const data = res.data.data;
    const article: Article = {
      ...data,
      created_time: data.created_at,
      updated_time: data.updated_at,
      like_count: data.like_count ?? 0,
    };

    currentArticle.value = article;
    return article;
  }

  async function fetchAllArticles() {
    loading.value = true;
    try {
      const res = await getArticles({ page: 1, page_size: 100 });
      const responseData = res.data;
      const payload = responseData.data.articles;
      articleList.value = payload.items.map((article: Article) => ({
        ...article,
        created_time: article.created_at,
        updated_time: article.updated_at,
        like_count: article.like_count ?? 0,
      }));
      total.value = payload.total;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTags() {
    const res = await getTags();
    tags.value = res.data.data.tags.items;
  }

  return {
    articles,
    currentArticle,
    tags,
    total,
    loading,
    articleList,
    fetchArticles,
    fetchArticle,
    fetchTags,
    fetchAllArticles,
  };
});

export interface Article {
  id?: number;
  title: string;
  slug: string;
  cover: string | null;
  content?: string;
  tags: Tag[];
  is_draft?: boolean;
  created_at: string;
  updated_at: string;
  created_time: string;
  updated_time: string;
  like_count: number;
}

export interface Tag {
  id: number;
  name: string;
  article_count?: number;
}
