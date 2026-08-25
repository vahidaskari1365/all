"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { ActionButton, AdminBadge, AdminCard, AdminTable, Fa } from "@/components/admin/ui";
import { deleteBlogPost, saveBlogPost } from "@/lib/admin-actions";
import type { getAdminBlogPosts } from "@/lib/admin-queries";

type PostRow = Awaited<ReturnType<typeof getAdminBlogPosts>>[number];

function PostForm({ initial, onDone }: { initial?: PostRow; onDone: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);

  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="grid gap-3">
        <label>
          <span className="mb-1 block text-[11px] font-bold text-slate-500">عنوان مطلب</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="عنوان…" />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-bold text-slate-500">خلاصه (excerpt)</span>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="input" placeholder="یک جمله کوتاه…" />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-bold text-slate-500">متن کامل</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="input resize-y leading-7"
            placeholder="متن مطلب — پاراگراف‌ها را با خط خالی جدا کنید."
          />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-bold text-slate-500">آدرس تصویر کاور (اختیاری)</span>
          <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="input" dir="ltr" placeholder="https://…" />
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          انتشار عمومی
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <ActionButton
          className="bg-primary px-4 py-2.5 text-white hover:bg-primary-700"
          action={async () =>
            saveBlogPost({
              id: initial?.id,
              title,
              excerpt,
              content,
              coverUrl,
              published,
            })
          }
        >
          <Save className="h-4 w-4" />
          ذخیره مطلب
        </ActionButton>
        <button
          type="button"
          onClick={onDone}
          className="cursor-pointer rounded-lg px-3 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function BlogTab({ posts }: { posts: PostRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PostRow | null>(null);

  return (
    <AdminCard
      title="مدیریت بلاگ"
      action={
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
          مطلب جدید
        </button>
      }
    >
      {(showForm || editing) && (
        <div className="mb-4">
          <PostForm
            initial={editing ?? undefined}
            onDone={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}
      <AdminTable head={["عنوان", "وضعیت", "تاریخ", "عملیات"]}>
        {posts.map((p) => (
          <tr key={p.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3">
              <p className="font-bold text-ink">{p.title}</p>
              <Link
                href={`/blog/${p.slug}`}
                className="mt-0.5 inline-block text-[11px] text-primary-700 hover:underline"
              >
                /blog/{p.slug}
              </Link>
            </td>
            <td className="px-4 py-3">
              {p.published ? (
                <AdminBadge tone="green">
                  <Eye className="h-3 w-3" />
                  منتشرشده
                </AdminBadge>
              ) : (
                <AdminBadge tone="slate">
                  <EyeOff className="h-3 w-3" />
                  پیش‌نویس
                </AdminBadge>
              )}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-500">
              <Fa value={new Date(p.createdAt).toLocaleDateString("fa-IR")} />
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(p);
                    setShowForm(false);
                  }}
                  className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="ویرایش مطلب"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <ActionButton
                  className="p-2 text-rose-600 hover:bg-rose-50"
                  confirmText="مطلب حذف شود؟"
                  action={() => deleteBlogPost(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </ActionButton>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminCard>
  );
}
