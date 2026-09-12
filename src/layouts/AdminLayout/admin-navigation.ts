import type { Component } from "vue";
import {
  ChatDotRound,
  ChatLineRound,
  CollectionTag,
  DataAnalysis,
  Document,
  EditPen,
  Notebook,
  Setting,
  User,
} from "@element-plus/icons-vue";

export interface AdminNavigationChild {
  label: string;
  to: string;
  icon: Component;
}

export interface AdminNavigationItem {
  label: string;
  code: string;
  to: string;
  icon: Component;
  children?: AdminNavigationChild[];
}

export const adminNavigation: AdminNavigationItem[] = [
  {
    label: "总览",
    code: "OVERVIEW",
    to: "/admin/dashboard",
    icon: DataAnalysis,
  },
  {
    label: "文章管理",
    code: "ARTICLES",
    to: "/admin/articles",
    icon: Document,
    children: [
      {
        label: "创建文章",
        to: "/admin/article/edit",
        icon: EditPen,
      },
    ],
  },
  {
    label: "笔记管理",
    code: "ESSAYS",
    to: "/admin/essays",
    icon: Notebook,
    children: [
      {
        label: "创建笔记",
        to: "/admin/essay/create",
        icon: EditPen,
      },
    ],
  },
  {
    label: "评论管理",
    code: "COMMENTS",
    to: "/admin/comments",
    icon: ChatDotRound,
  },
  {
    label: "留言管理",
    code: "MESSAGES",
    to: "/admin/message",
    icon: ChatLineRound,
  },
  {
    label: "标签管理",
    code: "TAGS",
    to: "/admin/tags",
    icon: CollectionTag,
  },
  {
    label: "用户管理",
    code: "ACCOUNT",
    to: "/admin/users",
    icon: User,
  },
  {
    label: "网站设置",
    code: "SETTINGS",
    to: "/admin/settings",
    icon: Setting,
  },
];

const adminPageLabels: Record<string, string> = {
  AdminDashboard: "总览",
  AdminArticles: "文章管理",
  AdminArticleEdit: "文章编辑",
  AdminEssays: "笔记管理",
  AdminEssayCreate: "创建笔记",
  AdminEssayEdit: "笔记编辑",
  AdminComments: "评论管理",
  AdminMessages: "留言管理",
  AdminTags: "标签管理",
  AdminUsers: "用户管理",
  AdminSettings: "网站设置",
};

export function getAdminPageLabel(routeName: unknown) {
  return adminPageLabels[String(routeName)] || "管理控制台";
}
